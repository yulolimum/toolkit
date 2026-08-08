# EAS

Expo Application Services (EAS) builds, submits, and updates React Native apps. GitHub Actions decides when builds run and waits for EAS to finish. Firebase App Distribution delivers Android tester builds.

## Build environments

Build environments select the app configuration and the services it talks to.

| Build environment | Use                                | Services                               |
| ----------------- | ---------------------------------- | -------------------------------------- |
| `development`     | Local development                  | Local or developer-configured services |
| `preview`         | PR builds and shared tester builds | PR-specific or shared preview services |
| `production`      | Store release                      | Production services                    |

## Configuration

Copy [`configs/eas.json`](../configs/eas.json) into the mobile app as `eas.json`. Keep it aligned with the app's `app.config.ts`, package scripts, and GitHub workflows.

The app should derive its build environment from `EAS_BUILD_PROFILE` and store it in Expo `extra`. Build environment, icon variant, and service configuration should agree.

Use fingerprint-based runtime versions:

```ts
runtimeVersion: {
  policy: 'fingerprint'
}
```

The runtime fingerprint determines which OTA updates are compatible with an installed native build. Native configuration or dependency changes require a new native build.

## Profiles

| Profile       | Build environment | Android                      | iOS                                 | EAS update channel |
| ------------- | ----------------- | ---------------------------- | ----------------------------------- | ------------------ |
| `development` | development       | development-client APK       | development client                  | `development`      |
| `preview:pr`  | preview           | internal APK                 | ad hoc                              | `pr-<number>`      |
| `preview`     | preview           | APK through EAS and Firebase | TestFlight                          | `preview`          |
| `production`  | production        | AAB through Play             | TestFlight and App Store submission | `production`       |

`preview:pr` is a static, disposable PR profile. The PR workflow replaces the PR placeholder in `eas.json` before it builds, which gives each PR its own `pr-<number>` channel.

`preview` is the shared tester build. It uses preview services and the preview update channel. Android produces an APK for EAS and Firebase App Distribution; iOS goes to TestFlight.

`production` produces store artifacts. Android builds an AAB for Google Play, and iOS goes through TestFlight before App Store release.

## Channels and branches

OTA updates publish to branches. Each channel receives updates from its linked branch.

```text
preview channel    <- preview branch
production channel <- production branch
pr-123 channel     <- pr-123 branch
```

Use a new native build for changes to native dependencies, Expo config, native plugins, permissions, app signing, or platform assets. Use OTA updates for compatible JavaScript and asset-only changes.

## Fingerprinting

Fingerprinting hashes the native shape of the app: Expo config, native plugins, native dependencies, platform assets, and generated native inputs. Use `fingerprint.config.js` and `.fingerprintignore` when the app needs to refine that input.

Run these commands from the directory that contains `eas.json`:

```bash
npx @expo/fingerprint fingerprint:generate --platform ios
npx @expo/fingerprint fingerprint:generate --platform android
```

Inspect a shared preview or production fingerprint with the matching profile:

```bash
EAS_BUILD_PROFILE=preview npx @expo/fingerprint fingerprint:generate --platform ios
EAS_BUILD_PROFILE=preview npx @expo/fingerprint fingerprint:generate --platform android
EAS_BUILD_PROFILE=production npx @expo/fingerprint fingerprint:generate --platform ios
EAS_BUILD_PROFILE=production npx @expo/fingerprint fingerprint:generate --platform android
```

## Builds

The toolkit includes `pnpm eas:build` for development, shared preview, and production profiles. It does not build PR previews, which belong to CI because they need a PR-specific channel.

Run EAS builds from the directory that contains `eas.json`:

```bash
npx eas-cli@latest build --profile development --platform ios --non-interactive
npx eas-cli@latest build --profile development --platform android --non-interactive

npx eas-cli@latest build --profile preview --platform ios --non-interactive
npx eas-cli@latest build --profile preview --platform android --non-interactive

npx eas-cli@latest build --profile production --platform ios --non-interactive
npx eas-cli@latest build --profile production --platform android --non-interactive
```

## Submits

The `preview` profile submits iOS builds to TestFlight. `production` submits both store artifacts.

```bash
npx eas-cli@latest submit --profile preview --platform ios --latest --non-interactive

npx eas-cli@latest submit --profile production --platform ios --latest --non-interactive
npx eas-cli@latest submit --profile production --platform android --latest --non-interactive
```

The toolkit includes `pnpm eas:submit` for the same profiles.

## Updates

Use EAS Update only for JavaScript and asset changes that do not need a native build.

```bash
EAS_BUILD_PROFILE=preview npx eas-cli@latest update --platform all --channel preview --environment preview --auto --non-interactive
EAS_BUILD_PROFILE=production npx eas-cli@latest update --platform all --channel production --environment production --auto --non-interactive
```

The toolkit includes `pnpm eas:update` for the shared preview and production channels.

## CI workflows

Copy the workflow templates into `.github/workflows/` and replace their placeholders. They assume a mobile app in `apps/mobile`; update the paths and workspace package name when a project uses a different layout.

| Workflow                | Profile      | Purpose                                                                                                                         |
| ----------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `mobile-ci.yml`         | none         | Runs mobile checks for non-draft pull requests.                                                                                 |
| `mobile-pr-preview.yml` | `preview:pr` | Builds or reuses PR-specific internal builds and publishes OTA updates when a PR needs isolated services.                       |
| `mobile-preview.yml`    | `preview`    | On merge to `main`, creates a shared tester build, submits iOS to TestFlight, and distributes the Android APK through Firebase. |
| `mobile-production.yml` | `production` | Manually builds and submits App Store and Google Play artifacts.                                                                |

### PR previews

PR previews are opt-in. Add the `mobile/preview` label to a non-draft PR with mobile changes. On success, the workflow adds `mobile/preview-available`.

The workflow replaces the PR channel placeholder, generates both fingerprints, reuses compatible builds when possible, creates missing builds, and publishes an OTA update to the PR branch.

Use this workflow when a mobile PR needs unreleased services or a dedicated tester build. Most mobile-only PRs can use the shared preview distribution after they merge.

### Shared preview and production distribution

The shared preview workflow requires an Expo token, a Firebase App Distribution service-account secret named `FIREBASE_APP_DISTRIBUTION_KEY`, a Firebase app ID, and a tester group. The workflow templates leave the Firebase values as placeholders.

Store releases remain manually dispatched. Configure EAS credentials and the Apple and Google submission details before running the production workflow.
