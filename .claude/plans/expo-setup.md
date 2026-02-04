# Expo Setup Plan - Super Body Mobile

## Current State

The mobile app at `apps/mobile/` is missing all configuration files:
- No `package.json` (dependencies not managed locally)
- No `app.json` (Expo configuration)
- No `metro.config.js` (Metro bundler config)
- No `babel.config.js` (Babel config)
- No `tsconfig.json` (TypeScript config)

The existing code already uses React Native, AsyncStorage, and Supabase but cannot run without these config files.

## Files to Create

### 1. `apps/mobile/package.json`
Purpose: Define all mobile dependencies for React Native + Expo

**Core Dependencies:**
- `react@~18.2.0`
- `react-native@~0.73.0`
- `expo@~50.0.0`

**Supabase:**
- `@supabase/supabase-js@^2.93.3`
- `@react-native-async-storage/async-storage@^1.21.0`

**Navigation (for future use):**
- `@react-navigation/native@^6.1.0`
- `@react-navigation/bottom-tabs@^6.5.0`
- `@react-navigation/native-stack@^6.9.0`
- `react-native-screens@~3.29.0`
- `react-native-safe-area-context@~4.8.0`

**File/Asset Handling:**
- `expo-image-picker@~15.0.0`
- `expo-document-picker@~12.0.0`
- `expo-file-system@~16.0.0`

**Charts/UI:**
- `react-native-svg@~14.1.0`
- `react-native-gesture-handler@~2.14.0`
- `react-native-reanimated@~3.6.0`

### 2. `apps/mobile/app.json`
Purpose: Expo configuration for iOS/Android

**Configuration:**
- App name: "Super Body"
- Slug: `super-body`
- Bundle ID: `com.superbody.app`
- Orientation: Portrait
- Theme: Dark mode (#0B0F14 background, #8CD98C accent)
- iOS permissions: Camera, Photo Library
- Android permissions: Camera, Storage, Network

### 3. `apps/mobile/metro.config.js`
Purpose: Metro bundler configuration

**Standard Expo Metro config** with module resolution

### 4. `apps/mobile/babel.config.js`
Purpose: Babel transpilation config

**Presets:** `babel-preset-expo`
**Plugins:** `react-native-reanimated/plugin` (must be last)

### 5. `apps/mobile/tsconfig.json`
Purpose: TypeScript configuration

**Features:**
- Strict mode enabled
- Path alias `@/*` → `./src/*`
- Extend expo/tsconfig.base

## Verification Steps

After creating these files:

1. Run `cd apps/mobile && npm install` to install dependencies
2. Run `npx expo start` to verify app starts
3. Run on iOS Simulator: `npx expo run:ios`
4. Run on Android Emulator: `npx expo run:android`
5. Verify auth flow still works (login → todos screen)
6. Verify Supabase connection with existing .env variables

## File Paths

| File | Path |
|------|------|
| package.json | `/apps/mobile/package.json` |
| app.json | `/apps/mobile/app.json` |
| metro.config.js | `/apps/mobile/metro.config.js` |
| babel.config.js | `/apps/mobile/babel.config.js` |
| tsconfig.json | `/apps/mobile/tsconfig.json` |

## Critical Reference Files

| Purpose | File |
|---------|------|
| Existing App.tsx | `/apps/mobile/App.tsx` |
| Supabase client | `/apps/mobile/src/lib/supabase.ts` |
| Environment vars | `/apps/mobile/.env` |
| Root package.json | `/package.json` (workspace config) |
