# Push Notifications

In this document, we'll cover _mostly_ everything needed to understand push notification concepts and implementation approaches.

## Table of Contents

- [How Push Notifications Work](#how-push-notifications-work)
- [Remote vs Local Notifications](#remote-vs-local-notifications)
- [Server](#server)
  - [Server-Side Flow Overview](#server-side-flow-overview)
  - [Common Server Concepts](#common-server-concepts)
  - [Option 1: Expo Push Service](#option-1-expo-push-service)
  - [Option 2: Firebase Cloud Messaging (FCM)](#option-2-firebase-cloud-messaging-fcm)
- [Client](#client)
  - [Common Setup](#common-setup)
  - [Option 1: Expo Notifications](#option-1-expo-notifications)
  - [Option 2: Firebase Messaging w/ Notifee](#option-2-firebase-messaging-w-notifee)

## How Push Notifications Work

1. **Device Registration**
   The app requests a device token from the platform's push service (APNs for iOS, FCM for Android) or if using Expo Push Service, the expo push token. This token uniquely identifies the device. This usually happens each time the app launches or when the token is refreshed. The app can additionally submit information about the device itself in case a user is logged in on multiple devices.

2. **Token Sync**
   The device token is sent to your backend server and stored, typically associated with a user and/or the user's device.

3. **Message Trigger**
   When something needs to notify the user (e.g., a new message), the backend sends a request to the push service (APNs/FCM/ExpoPushService) with the target token and message payload.

4. **Delivery**
   The push service delivers the notification to the device. If the app is in the background or terminated, the system handles showing the notification. If the app is in the foreground, the app may need to handle the display manually.

### High-Level Flow

```text
[User Device]
     │
     ▼
[Platform Push Service]  (APNs or FCM or Expo Push Service)
     │
     ▼
[Your Backend Server]
     │
     ▼
[Trigger: New Message, Status Update, etc.]
     │
     ▼
[Platform Push Service]
     │
     ▼
[User Device receives notification]
```

### Token Registration Flow

```text
App launches
     │
     ▼
Requests device token ───────▶ APNs / FCM / Expo
     │                             │
     ▼                             ▼
Receives device token       Issues token
     │
     ▼
Sends token to backend ──▶ Store token
```

## Remote vs Local Notifications

> [Notification Types](https://docs.expo.dev/push-notifications/what-you-need-to-know/)

Although both concepts display notifications on a user's device, there are some caveats. Additionally, different libraries are required to display each type.

**Remote Notifications**

- Sent from your backend via APNs (iOS) or FCM (Android) or routed through Expo Push Service.
- Requires an internet connection.
- Typically triggered by external events (e.g., new messages, status updates, friend requests).
- Can include payloads for silent updates or user-visible alerts.

> **Note**: On iOS, remote notifications are not shown as banners when the app is in the foreground. The app must handle them manually and show a local alert if needed. On Android, it varies by version/OEM.

**Local Notifications**

- Scheduled and triggered by the app on the device itself.
- No internet or backend required.
- Used for reminders, timers, or alerts based on local app state or time.
- Cannot update or cancel from the server after scheduling.

> **Note**: Local notifications do not require a device token, as they are managed by the app itself.

## Server

The server-side implementation involves storing device tokens, sending push notifications, and handling delivery confirmations. There are two main approaches depending on which client library is used.

### Server-Side Flow Overview

The following diagrams illustrate how notifications flow from your backend to user devices:

#### Option 1: Expo Push Service Flow

```text
[App Event Triggered]
                    │
                    ▼
            [Your Backend Server]
                    │
                    ▼ (Expo Push Token + Payload)
            [Expo Push Service]
                    │
                    ├─────────────────────┐
                    ▼                     ▼
                [FCM]                 [APNs]
                    │                     │
                    ▼                     ▼
            [Android Device]      [iOS Device]
```

#### Option 2: Firebase FCM Flow

```text
[App Event Triggered]
                    │
                    ▼
            [Your Backend Server]
                    │
                    ▼ (FCM Token + Payload)
            [Firebase Cloud Messaging]
                    │
                    ├─────────────────────┐
                    ▼                     ▼
            [Direct Delivery]     [APNs Bridge]
                    │                     │
                    ▼                     ▼
            [Android Device]      [iOS Device]
```

**Key Differences:**

- **Expo Push Service**: Acts as a unified layer that handles both FCM and APNs integration
- **Firebase FCM**: Directly integrates with FCM for Android, uses APNs bridge for iOS
- **Token Types**: Expo uses `ExponentPushToken[...]`, FCM uses native platform tokens

### Common Server Concepts

Regardless of which push service you use, all server implementations share these core responsibilities:

#### Token Management

- **Store Device Tokens**: Save tokens received from mobile clients in your database
- **Associate with Users**: Link tokens to user accounts for targeted messaging
- **Handle Token Updates**: Tokens can change or become invalid over time
- **Clean Up Invalid Tokens**: Remove tokens that are no longer valid to maintain good standing
- **Multi-Device Support**: Users may have multiple devices with different tokens
  - Store device identifiers alongside tokens to track individual devices
  - Decide on delivery strategy: send to latest token, send to all devices, or user preference

#### Notification Payload Structure

Both services support similar notification fields:

- **Title & Body**: Main notification content
- **Data**: Custom payload for app-specific information
- **Badge**: App icon badge count (iOS)
- **Sound**: Custom or default notification sounds
- **Priority**: Delivery urgency (normal vs high)

**Notification Types:**

- **Content Notifications**: Include title/body and are displayed to users as visible notifications
- **Data-Only Notifications**: Contain only custom data payload, delivered silently to the app for background processing

#### Error Handling Best Practices

- **Retry Logic**: Implement exponential backoff for temporary failures
- **Rate Limiting**: Respect service limits to avoid throttling
- **Invalid Token Handling**: Stop sending to unregistered devices
- **Delivery Confirmation**: Check receipts/responses for delivery status

### Option 1: Expo Push Service

> [Expo Push Service documentation](https://docs.expo.dev/push-notifications/sending-notifications/)

The Expo Push Service provides a simplified API for sending notifications to Expo apps.

#### When to Use Expo Push Service

- **Expo Projects**: Apps built with Expo or using expo-notifications
- **Simplified Backend**: Easier implementation than direct FCM/APNs integration
- **Unified API**: Single endpoint for both iOS and Android
- **No Platform-Specific Setup**: Expo handles FCM/APNs integration

#### Key Features

- **Node.js SDK**: Use the official `expo-server-sdk-node` for easy integration
- **Batch Sending**: Send up to 100 notifications per request
- **Two-Step Process**: Push tickets → Push receipts for delivery confirmation

#### Rate Limits

- **600 notifications per second** per project
- **100 notifications per request** maximum
- **1000 receipt IDs per request** for checking delivery status

### Option 2: Firebase Cloud Messaging (FCM)

> [Firebase Cloud Messaging documentation](https://firebase.google.com/docs/cloud-messaging)

Firebase Cloud Messaging provides direct integration with Google's push notification infrastructure. FCM also handles sending iOS notifications through the APNs bridge. FCM can be used reliably with Expo projects and is often the default go-to choice for many teams.

#### When to Use FCM

- **Firebase Ecosystem**: Already using Firebase services
- **Direct Control**: Need access to FCM-specific features
- **Expo Projects**: Works reliably with Expo apps as an alternative to Expo Push Service

#### Key Features

- **Cross-Platform**: Handles both Android (direct) and iOS (via APNs bridge)
- **Firebase Analytics**: Deep integration with Firebase Analytics for notification tracking
- **A/B Testing**: Seamless integration with Firebase Remote Config for notification experiments

#### Cross-Platform Considerations

**Android**: Direct FCM delivery

- Native FCM integration
- Notification channels support
- Background processing capabilities

**iOS**: FCM → APNs bridge

- FCM acts as intermediary to APNs
- Requires APNs certificate/key configuration
- iOS-specific payload formatting

#### Message Format

FCM uses a structured message format with platform-specific sections:

- **Common fields**: `notification`, `data`, `token`
- **Android-specific**: `android` section for FCM features
- **iOS-specific**: `apns` section for APNs features

#### Rate Limits

- **No explicit rate limits** but subject to FCM quotas
- **Batch messaging**: Up to 500 tokens per request
- **Topic messaging**: No limit on subscriber count

## Client

The client-side implementation involves configuring the mobile app to receive and handle push notifications. There are two main approaches for React Native apps.

### Common Setup

Regardless of which notification library you choose, both platforms require specific setup and configuration.

#### iOS Requirements

- **Provisioning Profile**: A provisioning profile with push notification capabilities enabled.
- **APNs Authentication**: An APNs authentication key or certificate for your app.
- **Permissions**: Request notification permissions from the user at runtime.

#### Android Requirements

- **Firebase Project**: A Firebase project with your Android app registered.
- **google-services.json**: The Firebase configuration file added to your Android app.
- **Permissions**: On Android 13+, notification permissions must be requested at runtime.

#### Permission Handling

Both approaches require requesting notification permissions from users:

- **iOS**: Granular permissions (alerts, sounds, badges) with different authorization statuses
- **Android**: Simple granted/denied, but Android 13+ requires explicit permission request

#### App State Behavior

| App State  | Notification Handling                                                                    |
| ---------- | ---------------------------------------------------------------------------------------- |
| Foreground | Notification is **received**, but **not shown** by default. App must handle it manually. |
| Background | Notification is **received and shown automatically** as a system notification.           |
| Terminated | Notification is **delivered and shown** by the OS if properly configured.                |

Different code paths are needed depending on the state to ensure consistent UX.

### Option 1: Expo Notifications

> [Expo Notifications documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)

For Expo projects, `expo-notifications` provides a unified API for both local and remote notifications.

#### Key Features

- **Unified API**: Handle both local and remote notifications with one library
- **Expo Push Service**: Use Expo's push notification service with Expo push tokens
- **Native Token Support**: Also supports native FCM/APNs tokens if needed
- **Built-in Features**: Notification channels, categories, scheduling, and badge management
- **Better Integration**: Seamless integration with Expo development workflow

### Option 2: Firebase Messaging w/ Notifee

> [React Native Firebase documentation](https://rnfirebase.io/messaging/usage)  
> [Notifee documentation](https://notifee.app/)

Firebase Cloud Messaging (FCM) works for both iOS and Android platforms. While this is a Google product, it can be confusing since it also handles iOS notifications through APNs integration.

#### When to Choose Firebase Messaging w/ Notifee

- Direct Firebase ecosystem integration required
- Existing Firebase infrastructure
- Need FCM-specific features not available in Expo
- Non-Expo React Native projects

#### Key Features

- **Cross-platform**: Works on both iOS and Android despite being a Google product
- **APNs Integration**: On iOS, FCM acts as a bridge to Apple Push Notification service
- **Direct Control**: More granular control over Firebase-specific features
- **Existing Infrastructure**: Good choice if already using Firebase services
- **Local Notifications**: Requires Notifee for local notification functionality, as Firebase Messaging only handles remote notifications

#### Library Combination

- **@react-native-firebase/messaging**: Handles remote push notifications from your server
- **@notifee/react-native**: Handles local notifications, scheduling, and advanced notification features
- **Two-library approach**: Unlike Expo Notifications which provides both in one package
