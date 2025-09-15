# Environment Setup Guide

In this guide, we'll go over the various tools, utilities, and software needed to successfully run/build a React Native project. This will produce a "bare minimum" setup that gets you going, but may not include _absolutely everything_ that will eventually be needed for all aspects of building a cross-platform application. Additionally, some choices may be opinionated; however, the intent is to get set up quickly and leave room for personal preference (we'll throw in some recommendations along the way). The starting point for some machines may differ, but we'll make the assumption of a fresh computer.

## Table of Contents

- [Environment Setup](#environment-setup)
  - [Utilities](#utilities)
    - [brew](#brew)
    - [watchman](#watchman-optional)
    - [asdf](#asdf)
  - [Languages](#languages)
    - [Node](#node)
    - [PNPM](#pnpm)
    - [Java](#java)
    - [CocoaPods](#cocoapods-optional)
  - [IDEs](#ides)
    - [VS Code](#vs-code)
    - [XCode](#xcode)
      - [Command Line Tools](#command-line-tools)
    - [Android Studio](#android-studio)
      - [Android SDK](#android-sdk)
      - [Android AVD / Emulator](#android-avd--emulator)
  - [Confirm Successful Setup](#confirm-successful-setup)

# Utilities

In this section we'll get you set up with the various utils needed to install the different programming languages and frameworks. Some of these tools are also not unique to React Native - you may find that you prefer similar alternatives to fit your workflow/preferences. Having said that, this will be the quickest setup for a fresh dev computer.

### brew

> Homebrew is a free and open-source software package management system that simplifies the installation of software on Apple's operating system, macOS, as well as Linux. <br/>https://brew.sh/

We'll be using brew to simplify the installation and management of other utils to get us going (e.g. watchman). This can also come in handy later for installing support packages for testing libraries, setting up deployments, etc. This is typically a one-step install process, but watch out for errors asking you to make additional changes to your path.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# restart shell, confirm installation
brew --version
```

Additionally, one of the post install steps for brew is setting up the brew env inside your `.zshrc`. This will give the rest of your `.zshrc` config access to software you have installed via brew.

```bash
# open ~/.zshrc and put at the top of the file:
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**brew** can also be used to install and configure various programming languages; however, we'll be using a different tool for consistency and speed.

### watchman (optional)

> Watchman exists to watch files and record when they change. It can also trigger actions (such as rebuilding assets) when matching files change. <br/> https://facebook.github.io/watchman/

React Native uses watchman to detect changes in the app's source and execute a Fast Refresh. Fast refresh is a term that combines both concepts of "hot reloading" and "live reloading". Depending on the module you are working in, the app will update and push the bundle to your simulator/emulator/device with or without an app restart (see [Fast Refresh](https://reactnative.dev/docs/fast-refresh)).

The reason this tool is marked "optional" is because, although recommended by the React Native setup guides, sometimes it can be a bit finicky and cause build issues. So, if you run into issues with it, you can try running `watchman watch-del-all` or uninstalling it completely.

```bash
brew install watchman

# restart shell, confirm installation
watchman --version
```

### asdf

> asdf is a CLI tool that can manage multiple language runtime versions on a per-project basis. It is like gvm, nvm, rbenv & pyenv (and more) all in one! Simply install your language's plugin! <br/> https://asdf-vm.com/

Nope, not a typo :) **asdf** is an all-in-one version manager for different languages, flavors, frameworks. Although **asdf** may not be your preferred way of installing these dependencies (e.g. [brew](#brew), nvm, chruby, etc), it has the most potential to keep all developers' env in sync (via a project level [`.tool-versions` file](https://asdf-vm.com/manage/configuration.html#tool-versions)). If you prefer to skip this step, be sure to have an equivalent capability for each language/framework.

```bash
brew install asdf
```

**Note:** If using [oh-my-zsh](https://ohmyz.sh/), you can configure your `~/.zshrc` file with the asdf plugin: `plugins=(asdf)`.

For more detailed installation instructions, follow the [installation guide](https://asdf-vm.com/guide/getting-started.html#getting-started) for your development environment.

```bash
# restart shell, confirm installation
asdf
```

When installing different runtimes with `asdf`, you have 2 options for setting the version of a language used. `asdf set -u [runtime] [version]` will set it globally for the entire system - this can be useful for certain languages like [node](#node) where certain tools will need it globally set (e.g. extensions in VS Code, Xcode build, etc). `asdf set [runtime] [version]` will create a `.tool-versions` file in your current directory that will be referenced while in that directory or its children.

If a `.tool-versions` file is present in the directory you're in, as long as you have all of the necessary asdf plugins (see individual steps for [node](#node) and [java](#java)), you can run `asdf install` and it will automatically install any missing runtime versions.

If at any point you want to know which version you're currently using, you can run `asdf current`.

---

## Languages

Now that we have the utilities installed/configured, we can proceed with installing the required languages. We'll need Java and Node. You can set the installed language version globally if you prefer; however, the project will probably have its own `.tool-versions` file which will dictate the required versions at the time.

Note: Most plugins support builds for different architectures automatically. When installing the languages, keep an eye on the logs and make sure the correct arch is being installed for your system.

### Node

**Node** will be used for bundling, running a dev server, and executing any scripts that are required by node dependencies/modules.

```bash
# add the asdf plugin
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git

# optional, see available node versions (LTS version recommended)
asdf plugin list all nodejs

# install node LTS (check for latest LTS version)
asdf install nodejs 22.16.0
# or, if within a dir with a .tool-versions file
asdf install

# optional, set global node version and confirm installation
asdf set -u nodejs 22.16.0
node --version
```

Note: The version shown (22.16.0) is an example - check for the latest LTS version at [nodejs.org](https://nodejs.org/) for your project.

Note: As mentioned in the [asdf](#asdf) section, if you want different tools in your editor to work, you're going to need at least some version of node to be set globally on your system.

Note: As of May 2025, running LTS versions of node will most likely show a `punnycode` warning. This is a known issue and can be ignored. Untill all packages are updated to not reference this deprecated module, this warning will keep popping up.

### PNPM

#### via **corepack**

Corepack is a package manager that comes bundled with Node.js starting from version 16.9.0. It allows you to use package managers like pnpm, yarn, and bun without needing to install them globally.

```bash
corepack enable pnpm
corepack use pnpm@latest-10
```

Note: Check [pnpm.io](https://pnpm.io/) for the latest version. The example shows `latest-10` which refers to the latest version in the 10.x series.

#### via **npm**

If you prefer to install pnpm globally, you can do so using npm:

```bash
npm install -g pnpm
```

### Java

This is needed for Android applications and gradle build steps. React Native setup instructions recommend JDK 17.

```bash
# add the asdf plugin
asdf plugin add java https://github.com/halcyon/asdf-java.git

# optional, see available java versions
asdf list all java

# install java (JDK 17 required for React Native)
asdf install java zulu-17.58.21
# or, if within a dir with a .tool-versions file
asdf install

# update ~/.zshrc to set JAVA_HOME
echo '. ~/.asdf/plugins/java/set-java-home.zsh' >> ~/.zshrc

# enable macOS integration
echo "java_macos_integration_enable = yes" >> ~/.asdfrc

# optional, set global java version and confirm installation
asdf set -u zulu-17.56.15
java --version
```

Note: React Native specifically requires JDK 17. The version examples shown (zulu-17.58.21, zulu-17.56.15) are specific JDK 17 builds - check for the latest JDK 17 version available.

### CocoaPods (optional)

**CocoaPods** is a dependency manager for Swift and Objective-C Cocoa projects. In React Native, it is used to manage dependencies for the iOS native side of the application. It is recommended to have CocoaPods installed globally on your system.

The reason this is optional is because most of the time, the React Native init script, the `expo prebuild` command or the commonly used node script `npx pod-install` will install CocoaPods CLI tool for you if it isn't there. If you want to control this step yourself, there are a few options:

#### via **brew**

This is a global, system-level install via [brew](#brew).

```bash
brew install cocoapods
```

#### via **ruby gem**

If you have a globally installed ruby version on your system, this will install cocoapods for the currently active ruby version.

```bash
sudo gem install cocoapods
```

---

## IDEs

### VS Code

> Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications. <br/>https://code.visualstudio.com/

Although not a _true_ IDE, with the right set of extensions and settings, this can make the development of React Native projects more efficient and consistent. To setup VS Code, download the app from https://code.visualstudio.com/download. Note: be sure to select the correct architecture build for your system. Here are some recommended extensions and settings:

Recommended Extensions:

- ESLint
- GitLens
- Prettier
- File Utils
- SVG Preview
- Version Lens

Editor Settings:

- Add the shell command `code` by hitting ⌘⇧P and typing "Shell Command: Install `code` command in PATH".

### XCode

Full setup instructions can be found in the [React Native iOS setup guide](https://reactnative.dev/docs/set-up-your-environment?platform=ios).

**Xcode** will be used to build/run the iOS native side of the React Native application. It will also handle things like code-signing, asset management, simulators, and in some cases debugging.

To install Xcode, head over to the [Mac App Store](https://itunes.apple.com/us/app/xcode/id497799835?mt=12) and download the latest available version (usually dependent on OS version). It's recommended to upgrade the OS to the latest in order to have the latest Xcode. But first, check with the team to see what everybody is on. Check your project requirements for the recommended Xcode version.

#### Command Line Tools

By this point, you have probably incidentally installed the command line tools while installing other items prior. To verify, open Xcode -> Preferences -> Locations -> Command Line Tools. Select the latest version if not already selected.

### Android Studio

Full setup instructions can be found in the [React Native Android setup guide](https://reactnative.dev/docs/set-up-your-environment?platform=android).

**Android Studio** and its dependencies (adb, platform-tools, etc) will be used to build/run the Android native side of the React Native application. This will also be used to manage SDKs, create/edit emulators, and in some cases debugging.

To install Android Studio, download it from [Android Developers site](https://developer.android.com/studio). Be sure to select the architecture that matches your system. During the install wizard step, you can use the default values for SDK and AVD options (we'll modify these later). While waiting for the install to finish, go ahead and update your PATH:

```bash
# open ~/.zshrc
code ~/.zshrc

# paste the following lines in the file
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# save file, restart shell, and verify
echo $ANDROID_HOME
```

Once the initial install completes, proceed to the next step.

#### Android SDK

On the Welcome screen, click on `More Actions -> SDK Manager`. Under Android 15 (VanillaIceCream), select the following (be sure to click on `Show Package Details` to be able to see the specific items listed below):

- Android SDK Platform 35
- Intel x86 Atom_64 System Image or Google APIs Intel x86 Atom System Image or (for Apple M1 Silicon) Google APIs ARM 64 v8a System Image

Under SDK Tools, make sure Android SDK Build Tools v35.0.0 is selected.

Click "OK" to install.

#### Android AVD / Emulator

Unlike Xcode which has the Simulators preconfigured, you will need to create an emulator. On the Welcome screen, click `More Actions -> Virtual Device Manager`. Here you can configure your emulators with the desired settings (add a bit more RAM). Later, you can use the Virtual Device Manager for launching specific emulators.

---

## Confirm Successful Setup

At this point, you should verify that everything has been setup correctly. You can do this by:

- Running `node --version`, `java --version`, etc. to confirm installations
- Creating a new React Native project and attempting to build it
- Or using a verification script if your project includes one (e.g., `npm run verify-env`)
