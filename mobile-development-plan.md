# Mobile App Development Plan - Super Body

## Current State

**Completed:**
- Authentication System (login/signup, session persistence)
- Todo Management (full CRUD with Supabase Realtime)
- Supabase Integration

**Partially Complete:**
- File Management (25% - basic UI stub only)

**Not Implemented:**
- Stock/Market Data UI
- AI Assistant Interface
- Navigation System
- Proper Expo/React Native setup (package.json, app.json, metro.config.js)

---

## Implementation Phases

### Phase 1: Expo/React Native Infrastructure Setup

**Create `/apps/mobile/package.json`**
- Dependencies: React Native ~0.73.0, Expo ~50.0.0, React Navigation v6
- Expo packages: image-picker, document-picker, video, av, linear-gradient
- Supabase: @supabase/supabase-js, @react-native-async-storage/async-storage
- UI: react-native-gesture-handler, react-native-reanimated, react-native-svg
- Dev: TypeScript, Babel presets

**Create `/apps/mobile/app.json`**
- Expo configuration for iOS/Android
- Permissions: Camera, Photo Library, Network
- Bundle identifier: com.superbody.app
- Plugins: expo-image-picker, expo-router

**Create `/apps/mobile/metro.config.js`**
- Standard Metro configuration

**Create `/apps/mobile/babel.config.js`**
- Babel preset for Expo with reanimated plugin

**Create `/apps/mobile/tsconfig.json`**
- TypeScript config with path aliases (@/*)

---

### Phase 2: Navigation System Setup

**Create `/apps/mobile/src/navigation/` directory**

**NavigationContainer.tsx** - Wrap app with NavigationContainer, theme config
**AppNavigator.tsx** - Bottom Tab Navigator with 5 tabs
**TabBarIcon.tsx** - Reusable tab icon component

**Create Stack Navigators:**
- `TodosStack.tsx` - TodosScreen + TodoDetailScreen
- `FilesStack.tsx` - FilesScreen + FilePreviewScreen + UploadOptionsModal
- `StocksStack.tsx` - StocksListScreen + StockDetailScreen
- `AIStack.tsx` - AIScreen + DocumentSearchResultScreen
- `SettingsStack.tsx` - SettingsScreen

**Modify `/apps/mobile/App.tsx`** - Replace ternary with NavigationContainer wrapper

---

### Phase 3: File Management Completion

**Create `/apps/mobile/src/services/FileUploadService.ts`**
- Image upload from camera/gallery using expo-image-picker
- Video upload with progress tracking
- Document upload using expo-document-picker
- Upload to Supabase Storage bucket 'files'

**Create `/apps/mobile/src/screens/files/ImagePreviewModal.tsx`**
- Full-screen image view with pinch-to-zoom
- Swipe to dismiss
- Download, Share, Delete actions

**Create `/apps/mobile/src/screens/files/VideoPlayerModal.tsx`**
- Full-screen video player using expo-av
- Playback controls, progress bar, volume
- Landscape mode support

**Create `/apps/mobile/src/screens/files/FilePreviewScreen.tsx`**
- Router-based preview for different file types
- Images, Videos, PDFs (WebView), Documents

**Enhance `/apps/mobile/src/files/FilesScreen.tsx`**
- Swipe-to-delete with confirmation
- Filter by type (All, Images, Videos, Documents)
- Sort by date/name
- Search by filename

---

### Phase 4: Stock/Market Data UI

**Create `/apps/mobile/src/types/stocks.ts`** - Port from web (StockSymbol, StockPrice, HistoricalDataPoint)

**Create `/apps/mobile/src/lib/stocks/api.ts`** - Adapt StockAPI class from web
- Sina Finance integration
- Polling instead of WebSocket (5-second intervals)

**Create `/apps/mobile/src/screens/stocks/StocksScreen.tsx`**
- Stock list with popular stocks (AAPL, GOOGL, MSFT, TSLA, NVDA, Chinese stocks)
- Real-time price updates (polling)
- Green/red colors for gains/losses
- Search bar with debounce
- Filter: All | Gainers | Losers
- Pull-to-refresh

**Create `/apps/mobile/src/screens/stocks/StockDetailScreen.tsx`**
- Large current price with change
- Timeframe selector (1D, 1W, 1M, 3M, 6M, 1Y)
- Historical chart using react-native-svg (line/area/candlestick)
- Volume bar chart
- Stock info (High, Low, Volume)
- Watchlist toggle

**Create `/apps/mobile/src/screens/stocks/StockChart.tsx`**
- Custom SVG chart components
- Line/Area charts with gradients
- Candlestick chart
- Touch interactions with price tooltip
- Animations

---

### Phase 5: AI Assistant Mobile Interface

**Create `/apps/mobile/src/types/ai.ts`** - Port from web (Message interface)

**Create `/apps/mobile/src/lib/aiService.ts`** - Adapt AIService from web
- Edge Function integration (/ai-assistant)
- Streaming response handling using fetch + readableStream reader
- No EventSource (not available in React Native)

**Create `/apps/mobile/src/screens/ai/AIScreen.tsx`**
- Main chat interface with header
- Message list + Input area

**Create `/apps/mobile/src/screens/ai/MessageList.tsx`**
- FlatList for messages
- User messages: right-aligned, gray
- Assistant messages: left-aligned, green-tinted
- Typing indicator
- Auto-scroll to bottom

**Create `/apps/mobile/src/screens/ai/MessageInput.tsx`**
- Multi-line text input
- Send button
- Clear button
- Focus on load

**Create `/apps/mobile/src/screens/ai/DocumentSearchResultScreen.tsx`**
- Display document search results from AI
- Navigate to file preview

---

### Phase 6: User Settings Screen

**Create `/apps/mobile/src/screens/settings/SettingsScreen.tsx`** - Adapt from web SettingsForm
- Profile section (Avatar, Name, Email)
- Notifications section
- Appearance section (Theme toggle)
- About section
- Sign out button with confirmation

**Profile Management:**
- Display user avatar
- Edit name fields (first_name, last_name)
- Upload avatar using expo-image-picker
- Update Supabase users table

**Preferences:**
- Notification toggles
- Theme selector (Light/Dark/System)
- Save to users.settings JSON column

**Sign Out:**
- Centralized sign out (move from individual screens)
- Alert confirmation
- Call AuthProvider.signOut()

---

### Phase 7: Integration and Polish

**Modify `/apps/mobile/src/todos/TodosScreen.tsx`**
- Remove sign out button (moved to Settings)

**Create `/apps/mobile/src/components/` shared components:**
- `LoadingSpinner.tsx` - Green accent loader
- `ErrorDisplay.tsx` - Error with retry button
- `EmptyState.tsx` - Placeholder with icon + message
- `ErrorBoundary.tsx` - Catch component errors

**State Management:**
- Use Supabase Realtime for data sync
- Local React state for UI

---

### Phase 8: Testing Strategy

**Manual Testing Checklist:**
- Authentication: Sign up/in, error handling, sign out
- Todos: Create, edit, delete, toggle status, realtime updates
- Files: Upload image/video/document, preview, delete, filter
- Stocks: View list, search, filter, detail view, chart, pull-to-refresh
- AI: Send message, receive streaming, clear conversation
- Settings: Update profile, toggle notifications, change theme
- Navigation: All tabs, stack navigation, back gestures

**Testing Tools:**
- Jest + react-native-testing-library for unit tests
- Detox or Maestro for E2E tests

---

## Critical Files Reference

| Purpose | File Path |
|---------|-----------|
| Current mobile app | `/apps/mobile/` |
| Stock API reference | `/apps/web/src/lib/stocks/api.ts` |
| AI service reference | `/apps/web/src/services/aiService.ts` |
| Stock chart reference | `/apps/web/src/components/stocks/StockChart.tsx` |
| Message list reference | `/apps/web/src/components/ai/MessageList.tsx` |
| Settings reference | `/apps/web/src/components/SettingsForm.tsx` |
| Stock API docs | `/STOCK_API_README.md` |

---

## Dependencies & Sequencing

**Critical Path (must complete in order):**
1. Phase 1: Infrastructure (foundation for all)
2. Phase 2: Navigation (foundation for tabs/screens)
3. Phase 3-5: Files, Stocks, AI (can work in parallel after Phase 2)
4. Phase 6: Settings (can be anytime after Phase 2)
5. Phase 7: Integration (after features complete)
6. Phase 8: Testing (after all features complete)

**Estimated Time:** 12-13 days

---

## Key Technical Decisions

1. **Navigation:** React Navigation v6 with Bottom Tabs + Stack Navigators (industry standard)
2. **State:** Supabase Realtime + Local React State (matches web, no extra deps)
3. **Charts:** react-native-svg custom implementation (lightweight, full control)
4. **AI Streaming:** Manual chunk parsing (EventSource not available in RN)
5. **File Upload:** Direct to Supabase Storage (progress tracking, no intermediate server)

---

## Verification

**Post-Implementation Verification:**
1. Run `npm install` in `/apps/mobile/` to install dependencies
2. Run `npx expo start` to verify app starts without errors
3. Test auth flow: sign up → login → access all tabs
4. Create todo, edit, delete → verify realtime sync
5. Upload image from gallery → preview → delete
6. View stocks list → search → detail view → change timeframe
7. Send AI message → verify streaming response
8. Update settings → verify changes persist
9. Sign out → verify navigation to auth screen
10. Test on iOS Simulator and Android Emulator