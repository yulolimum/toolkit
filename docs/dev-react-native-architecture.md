# React Native architecture: old to new

## Overview

React Native has two architectural eras. Its original architecture relies on the Bridge, Paper, and Native Modules. The New Architecture changes how JavaScript and native code communicate.

```
Old Architecture                 New Architecture
─────────────────                ─────────────────
The Bridge           →           JSI (JavaScript Interface)
Paper (renderer)     →           Fabric (renderer)
Native Modules       →           Turbo Modules
(manual specs)       →           Codegen (auto-generated specs)
```

The New Architecture is designed around the limits of the old one.

## The old architecture

### The bridge

The bridge defines the old architecture. It carries messages between two separate runtime environments:

- The JS thread runs React components, state, and logic through JavaScriptCore or Hermes.
- Native threads render platform UI through UIKit on iOS and Android Views on Android, and access platform APIs such as the camera and GPS.

They cannot communicate directly. Every message is serialized to JSON, sent across the bridge, and deserialized on the other side. It is like passing notes between separate rooms: every note must be written, passed under the door, and read on the other side.

Every update from state to a native view must be encoded, queued, sent across the bridge, decoded, and applied. Bridge calls are asynchronous and batched, so native code cannot return a synchronous answer.

### Where it hurts

- Scrolling and animations: fast gestures produce many events. Each crosses the bridge as JSON, which can make scroll-linked animations janky and gesture responses lag.
- Large lists: FlatList can struggle because layout measurements require round trips across the bridge.
- Startup time: every native module initializes at launch, even if the app never uses it, because the bridge does not support lazy loading.

### Paper (old renderer)

Paper is the old rendering system. It turns `<View>`, `<Text>`, and `<Image>` components into native views on screen.

Paper works as follows:

1. React code produces a tree of components (the "virtual DOM" equivalent).
2. Paper computes a shadow tree, a parallel tree used for layout calculations through Yoga.
3. Layout results cross the bridge as JSON.
4. Native views get created or updated on the native side.

The shadow tree and native tree live on different threads and communicate over the bridge. Layout cannot be computed in step with rendering, which can cause brief layout flashes or "jumps."

### Traditional native modules

Native Modules expose platform APIs such as the camera, Bluetooth, and the file system to JavaScript. In the old architecture:

- A native class (Java/Kotlin or ObjC/Swift) gets written and registered by hand.
- The methods to expose get defined explicitly.
- At app startup, every registered native module initializes, even if nothing calls it.
- All calls go through the bridge (async, JSON-serialized).

From the JS side, a call like `NativeModules.MyModule.doSomething()` crosses the bridge, runs natively, and the result comes back asynchronously. There's never a synchronous return value.

## The new architecture

### JSI (JavaScript Interface)

JSI underpins the New Architecture. Instead of passing JSON across the bridge, it lets JavaScript hold direct references to C++ objects, and vice versa.

This makes the following possible:

- Synchronous calls: JavaScript can call a native function and get a result without serialization.
- No JSON overhead: data does not need to be serialized and deserialized.
- Shared ownership: JavaScript and native code can both hold references to the same underlying object.

JSI is a C++ layer, so it works on iOS and Android. JavaScript does not use it directly, but it enables the other New Architecture pieces.

### Fabric (new renderer)

Fabric replaces Paper and turns components into native views through a different model:

- The shadow tree is accessible to JavaScript and native code through JSI, so layout does not need a bridge round trip.
- Rendering can be synchronous when necessary, such as when a modal or alert needs a measurement before it paints.
- It supports concurrent rendering and React 18+ features such as transitions and Suspense.
- Priority scheduling lets high-priority updates, such as user touches, interrupt lower-priority work.

Fabric can reduce layout flashes, improve gesture-driven animations, and enable APIs such as `useTransition` to work properly in React Native.

### Turbo Modules

Turbo Modules replace traditional Native Modules. They provide:

- Lazy loading: modules initialize only when JavaScript first calls them, rather than at app startup.
- Synchronous access: because they use JSI instead of the bridge, a Turbo Module can return a value synchronously to JavaScript when appropriate.
- Type-safe contracts: each Turbo Module has a typed Codegen spec that defines its methods and their input and return types.

From JavaScript, usage looks much the same. The underlying implementation changes.

### Codegen

Codegen is a build-time tool that generates interface files in C++, Java, and ObjC from typed JavaScript specs.

In the old arch, the contract between JS and native was informal. JS code would call `NativeModules.Foo.bar(x)` and hope the native side actually had a method `bar` that accepts that type. Mismatches showed up as runtime errors.

With Codegen:

1. A spec file is written in JavaScript or TypeScript using Flow or TypeScript types, such as `NativeMyModule.ts`.
2. At build time, Codegen reads those types and auto-generates the native interface code.
3. The native implementation must match the generated interface. Otherwise, the mismatch becomes a compile-time error instead of a runtime crash.

For JavaScript-only code, Codegen makes TypeScript types for native modules enforceable at the native layer. It closes the gap between the JavaScript contract and the native implementation.

## How it all connects

The following shows how a button press calls a native API and updates the UI in each architecture.

### Old architecture flow

```
[JS Thread]                    [Bridge]                  [Native Thread]
                                  │
Button onPress fires       ──►   JSON encode     ──►    Native Module receives
NativeModules.Camera             serialize               call, opens camera
  .takePhoto()                   queue & send
                                  │
                              ◄── JSON encode    ◄──    Camera returns photo
Result arrives as                 serialize              data
Promise resolution                queue & send
                                  │
setState({ photo })        ──►   JSON encode     ──►    Paper creates/updates
triggers re-render               serialize               native ImageView
                                  queue & send
```

### New architecture flow

```
[JS Thread]                                        [Native/C++ Layer]
                                                          │
Button onPress fires       ── JSI (direct ref) ──►  TurboModule receives
TurboCamera.takePhoto()       no serialization        call, opens camera
                                                          │
                           ◄── JSI (direct ref) ──   Returns photo data
Result returned                no serialization       (can be sync)
(can be synchronous)                                      │
                                                          │
setState({ photo })        ── JSI (shared tree) ──►  Fabric updates
triggers re-render            concurrent-aware        native ImageView
                              priority-scheduled      (can be synchronous)
```

## The interop layers

The interop layers are adapters that let libraries written against old architecture APIs run on the new architecture. They run entirely on New Architecture infrastructure; they do not keep the old architecture alive.

Two interop layers handle different concerns.

### Fabric interop layer (renderer)

The Fabric interop layer handles visual components. If a library has a Paper-based native component that has not been rewritten for Fabric, the layer wraps it so it renders inside Fabric. When a prop updates or code sends a command, the layer forwards it to Fabric's UIManager, which translates it for the legacy component.

This layer shipped in RN 0.72 and initially required manual registration of component names in `react-native.config.js`. In newer React Native versions, legacy components are detected and wrapped automatically.

### Native Module interop layer (bridgeless)

The Native Module Interop Layer handles non-visual native modules. Early New Architecture releases kept the bridge running alongside JSI, so legacy native modules could continue to use it. Bridgeless mode removes the bridge, so legacy modules that depend on it require the Native Module Interop Layer. Shipped in RN 0.73, that layer intercepts legacy calls and routes them through JSI.

### What the interop layers do and don't cover

The layers support legacy dependencies. Rendering, props, events, and native calls usually continue to work automatically.

The interop layers do not support concurrent React features such as `startTransition`, `useDeferredValue`, and Suspense boundaries. If they happen to work, React Native does not guarantee that behavior. These features need a proper migration to Fabric and Turbo Modules.

### Timeline and longevity

As of RN 0.82 (October 2025), the old architecture can no longer be enabled. The New Architecture is the only architecture. The React Native team plans to support the interop layers for the foreseeable future and has not announced a deprecation date.

RN 0.83 (December 2025) introduced the opt-in iOS build flag `RCT_REMOVE_LEGACY_ARCH`. It lets fully migrated apps compile legacy code out of their own builds, reducing build time and binary size. The flag does not remove interop classes from React Native core, and RN 0.83 introduced no breaking changes. The interop layers will eventually be retired.

---

## Alternative module systems

Turbo Modules and Codegen are the standard path for authoring native modules. Expo Modules API and Nitro Modules are two alternatives. Both target the New Architecture directly and skip the interop layer.

### Expo Modules API

Expo built a module abstraction layer that lets library authors write one implementation for both architectures and platforms. Expo tooling generates the bindings for the active architecture. Libraries built with Expo Modules target the New Architecture directly instead of using the interop layer. This approach depends on Expo's module infrastructure.

### Nitro Modules

Nitro Modules is a project by Marc Rousavy, creator of VisionCamera and react-native-mmkv. Nitro generates direct C++ JSI bindings for communication between JavaScript and native code. Libraries built on Nitro target the New Architecture directly, skip the standard Turbo Module layer, and use JSI. A dependency that uses Nitro has invested in New Architecture support.

## Supplemental concepts

### Hermes

Hermes is the JavaScript engine built for React Native, replacing JavaScriptCore. It is not part of either architecture, but it is part of the New Architecture performance story. Its key feature is bytecode precompilation: JavaScript compiles to bytecode at build time, so Hermes does not parse raw JavaScript at startup.

As of RN 0.82, experimental Hermes V1 is available. It adds compiler and VM improvements that speed bundle loading and time to interactive. It does not yet include JavaScript-to-native or JIT compilation; those are still in testing.

### Yoga

Yoga is the cross-platform layout engine that handles Flexbox calculations. It exists in both architectures. In the old architecture, Yoga results cross the bridge. In the New Architecture, they are accessible through JSI.

### Bridgeless mode

Bridgeless mode removes the bridge instead of bypassing it. Early New Architecture versions kept the bridge as a fallback for legacy modules. The Native Module Interop Layer supports legacy modules that have not migrated. As of 0.82, bridgeless mode is the only mode.

### DOM node APIs

Starting with RN 0.82, native components expose DOM-like nodes through refs. Previously, refs returned React Native-specific objects with methods such as `measure` and `setNativeProps`. They now return nodes that implement a subset of the DOM API, including `parentNode`, `children`, `getBoundingClientRect`, and `ownerDocument`. This makes React Native's ref APIs more like web APIs. The legacy methods remain for backward compatibility.

## Practical guidance for dependency evaluation

Use the following labels when evaluating dependencies during a migration.

### Green: no concerns

- Nitro Modules with direct JSI bindings
- Expo Modules API
- Native Turbo Modules with Fabric implementations

These support concurrent features and do not depend on the interop layer.

### Yellow: works today, monitor going forward

A dependency that uses only the interop layer runs on New Architecture infrastructure through the automatic adapter. It cannot use concurrent features and will eventually need a rewrite when the interop layer is retired. Track its maintainers' migration progress.

### Red: blockers

Dependencies that do not work on the New Architecture, lack interop support, crash, or have critical bugs must be replaced or forked before moving to 0.82+.
