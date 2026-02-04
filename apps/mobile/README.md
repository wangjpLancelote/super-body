# Super Body - Mobile App

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/mobile
npm install
```

### 2. Install Expo CLI (if not already installed)

```bash
npm install -g @expo/cli
```

### 3. Run the App

```bash
# Start the development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web
npx expo start --web
```

### 4. Build for Production

```bash
# Build Android APK
expo build:android

# Build iOS IPA
expo build:ios
```

## Configuration

The app uses the following configuration files:

- `package.json` - Dependencies and scripts
- `app.json` - Expo app configuration
- `metro.config.js` - Metro bundler configuration
- `babel.config.js` - Babel transpilation configuration
- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables (Supabase configuration)

## Current Features

### ✅ Completed
- Authentication System (login/signup with Supabase)
- Todo Management (CRUD operations with real-time sync)
- Supabase Integration

### 🚧 Development Required
- File Management UI (currently basic stub)
- Navigation System (currently single screen)
- Stock/Market Data UI
- AI Assistant Interface

## Environment Variables

The app requires Supabase configuration in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_SUPABASE_EDGE_URL=your_supabase_edge_url
```

These are automatically synced from the root `.env` file.

## Next Steps

1. Complete File Management functionality
2. Implement Navigation with React Navigation
3. Add Stock Market UI
4. Add AI Assistant Interface
5. Implement Settings screen

## Tech Stack

- React Native
- Expo 50
- TypeScript
- Supabase (Auth & Database)
- React Navigation (future)
- React Native SVG (charts)
- AsyncStorage (session persistence)