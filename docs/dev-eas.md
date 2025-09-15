# EAS

This document covers Expo's [EAS service](https://docs.expo.dev/build/introduction/) and documents common EAS configuration patterns. Topics include:

- Builds
- Submitting
- OTA updates
- Process

## What is EAS

Expo Application Services (EAS) is a set of hosted services provided by Expo to build, submit, and update React Native apps. It helps speed up this process by handling native builds in the cloud, automating app store submissions, and enabling over-the-air (OTA) updates.

Traditionally, developers used tools like [Fastlane](https://fastlane.tools/) to script the steps required to build and submit apps. EAS uses Fastlane under the hood but abstracts that complexity away.

Most of your interaction will be through the `eas-cli`, which provides commands to trigger various steps like builds, submissions, and updates.

## EAS Configuration

There are two parts to configuring EAS:

1. **`eas.json`** — defines build presets and configurations.
2. **Code-signing** — manages certificates and provisioning for iOS and Android builds.

### `eas.json`

- https://docs.expo.dev/build/eas-json/
- https://docs.expo.dev/eas/json/

This file stores a set of build profiles that tell EAS how to build your app. Each profile can define:

- Build type (development, preview, or production)
- Environment variables
- Distribution settings (internal, app store, etc.)
- Platform-specific options (iOS and Android)

You can specify different profiles for different use cases, such as local testing, CI builds, or production releases.

### Code-signing

https://docs.expo.dev/app-signing/app-credentials/

Code-signing setup is handled through the EAS dashboard and involves interacting with App Store Connect (iOS) and Google Play Console (Android).

EAS allows you to store and manage certificates and provisioning profiles in the cloud, which simplifies the process and keeps all developers aligned. Without this, you'd need to manually share and sync credentials across machines—typically via encrypted files or a secrets manager.

## EAS Build

> A convenience script is provided via `pnpm eas:build` with interactive prompts.

Building an iOS or Android app with EAS involves generating a native binary (.ipa or .apk/.aab) along with the JavaScript bundle produced by Metro.

#### Profiles

The currently configured build profiles are:

- `preview` — primarily intended for pre-release testing but commonly used for development and QA. If needed, you can define additional build profiles to separate these environments.
- `preview:internal` — similar to `preview`, but outputs an APK (Android) and an ad-hoc build (iOS) for direct installation via EAS. Additional setup is required for ad-hoc iOS builds.
- `production` — the final release build configured for submission to the App Store or Play Store.

#### Environments

Each build profile uses a specific environment. It's recommended to define these environments in the EAS cloud dashboard to ensure consistency across all developers.

- `preview` — stores environment variables for development or staging, such as API endpoints and other config values.
- `production` — stores environment variables for the production build, like live API URLs and production-specific keys.

#### Channels

Channels in EAS define logical groupings for over-the-air (OTA) updates and are closely tied to the `eas update` system. Each build profile specifies a channel, which determines which set of updates that build will receive.

In the current configuration:

- `preview` and `preview:internal` use the `preview` channel.
- `production` uses the `production` channel.

When you run an OTA update using `eas update --channel <channel-name>`, only apps built with a matching channel will receive that update. This ensures that updates are scoped correctly to the right audiences (e.g., testers vs. production users).

#### Other Concepts

- **`appVersionSource`**  
  More commonly referred to as "build" or "build number" (iOS) or "version code" (Android). This defines where the app version is sourced from. In this setup, it's set to `"remote"`, which pulls the version from EAS.

- **`autoIncrement`**  
  When set to `true`, EAS will automatically bump the build number or version code for each new build. This is required for store submissions, as each new build must have a unique version code.

- **AAB vs APK**
  - **AAB (Android App Bundle)**: The recommended format for Play Store submissions. Smaller download sizes and optimized per device.
  - **APK (Android Package)**: Traditional Android install format. Easier for internal testing and direct installs but larger in size.

- **`resourceClass`**  
  Controls the compute resources allocated for a build. `large` uses more CPU/memory, which may speed up builds, especially for APKs that are more memory-intensive. This increases cost, so it may be worth testing with the default class to see if it suffices.

- **`distribution`**  
  This defines how the built app will be distributed:
  - `internal` — used for internal distribution, such as direct device installation via EAS or QR code. Useful for team testing or ad-hoc installs.
  - `store` — intended for submission to the TestFlight or Play Store (test or production tracks).

## EAS Submit

> A convenience script is provided via `pnpm eas:submit` with interactive prompts.

`eas submit` is used to upload your built binaries to the App Store (iOS) or Google Play (Android). This step comes after a successful `eas build`.

In the current config, the `submit` section of `eas.json` defines submission behavior for both `preview` and `production` profiles. Both submit the app to TestFlight (iOS) and the internal track on the Play Store (Android).

> **Note:** For Android, the first submission must be done manually through the Play Store Console by uploading the `.aab` file. You can generate this file using a local `eas build`.

## EAS Update

> A convenience script is provided via `pnpm eas:update` with interactive prompts.

`eas update` is used to push over-the-air (OTA) updates to apps that are already installed on users' devices. This allows you to deploy JavaScript and asset changes without going through the app store review process.

OTA updates only apply to apps built with the `expo-updates` module and are scoped by the `channel` they were built with. When an update is pushed to a channel, all installed apps using that channel are eligible to receive it.

#### Runtime Version

The core concept of `expo-updates` is determining which builds can receive which OTA updates. The rule of thumb is:

- If your changes include native code (e.g., dependency upgrades, changes to `app.config.ts`), **do not** use OTA. Instead, submit a new build to the App Store or Play Store.
- If your changes are limited to JavaScript or assets, you **can** ship them via OTA.

This project uses `appVersion` as the `runtimeVersion`. That means an OTA update targeting version `1.0.0` will apply to any build with app version `1.0.0`, regardless of build number. This is generally a safe and predictable setup.

You can read more about other runtime version strategies [here](https://docs.expo.dev/versions/latest/sdk/updates/#automatic-configuration-using-runtime-version-policies).

```text
OTA Update: Targeting appVersion 1.0.0
              │
              ▼
     ┌────────────────────┐
     │   appVersion 1.0.0 │
     └────────────────────┘
              │
     ┌────────┼────────┐
     ▼                 ▼
┌────────────┐   ┌────────────┐
│ Build A    │   │ Build B    │
│ Build 101  │   │ Build 102  │
│ ✅ Update  │   │ ✅ Update  │
└────────────┘   └────────────┘

              │
              ▼
     ┌────────────────────┐
     │   appVersion 1.0.1 │
     └────────────────────┘
              │
              ▼
        ┌────────────┐
        │ Build C    │
        │ Build 103  │
        │ ❌ Skipped  │
        └────────────┘
```

## General Process

#### Example Branching Strategy

The following is an example branching model that works well with EAS workflows:

- **main** — reflects code that is in production or about to be released.
- **dev** — your main development branch. Used for staging new features before release.
- **fix/your-branch** — short-lived branches created from `main` for production bug fixes.

This branching model allows for a predictable versioning strategy and provides a staging environment for OTA updates. You can adapt this approach to fit your team's preferred Git workflow.

#### Example: Releasing Version 1.0.0

1. **Prepare for release**
   - Merge release-ready code into `main`.

2. **Create a 1.0.0 production build**
   - `distribution`: `store`

3. **Create a 1.0.0 preview build**
   - `distribution`: `internal`
   - Used for internal QA, mirrors production for OTA testing

4. **Submit production build for review**
   - If rejected, repeat steps 2–4.
   - If approved, proceed.

5. **Release 1.0.0 to the public**

6. **Post-release workflow**
   - Begin development on `dev`.
   - Create `1.0.1` (or higher) `preview` builds for feature testing.
   - Use `1.0.0` preview build as a staging ground for OTA bugfix testing.

```text
                             EAS Release Flow
                             ────────────────

                            dev (feature work)
                                  │
                                  ▼
                            Merge to main
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
1.0.0 production build                          1.0.0 preview build
(distribution: store)                          (distribution: internal)
         │                                                 │
         ▼                                                 ▼
Submit to App Store / Play Store               Test OTA bug fixes
         │                                                 │
         ▼                                                 │
   Public Release                                          │
         │                                                 │
         └─────────────────────────────────────────────────┘
                                  │
                                  ▼
                1.0.1 preview builds (new features)

```

### Hotfix Flow with OTA

When a bug is found in `1.0.0` production:

1. Implement the fix. Using the `fix/your-branch` branch.
2. Test team downloads the `1.0.0` preview build from EAS internal.
3. Issue an OTA update targeting `1.0.0` using the `preview` channel.
4. Once validated, release the OTA update to the public `1.0.0` `production` channel.
5. Merge the `fix/your-branch` branch into `main` and `dev`.

```text
                             OTA Hotfix Flow
                             ───────────────

                     Bug found in 1.0.0 production
                                  │
                                  ▼
                       Create fix from `main`
                                  │
                                  ▼
                      OTA update to 1.0.0 preview
                                  │
                                  │
                                  ▼
            Test team installs and verifies 1.0.0 preview
                                  │
                                  ▼
                 OTA update pushed to 1.0.0 production

```

#### Next Release

When ready for a new app/play store release, repeat the process starting from merging into `main`.

#### Development

EAS Update can be integrated into your development workflow for faster iteration.

For example, after creating a `1.0.1` preview build:

- If your changes are **JavaScript-only** (no native code changes), you can push an OTA update to the `1.0.1` preview channel.
- If your changes **include native code** (e.g., dependency changes, config updates), you must create a new build for `1.0.1`. If needed, bump the app version to properly scope the update.

This allows you to test new features quickly while maintaining clear boundaries between builds that can receive OTA updates and those that require store releases.

## Convenience Scripts

The codebase includes interactive scripts to simplify common `eas-cli` tasks:

- `pnpm eas:build` — creates builds (cloud or local)
- `pnpm eas:submit` — submits builds to app/play stores
- `pnpm eas:update` — pushes OTA updates

These scripts use prompts to guide you through platform selection, profile selection, and other options. They can be extended to support additional `eas.json` profiles as needed.

#### Local Builds

The `pnpm eas:build` script includes a flag to run builds locally (outside of EAS cloud). Local builds are saved to a folder for manual installation or submission.

- Useful for quick tests or one-off device installs
- Can be submitted via `pnpm eas:submit` using the local flag

> **Note:** To support future OTA updates, builds must be created on EAS servers instead.
