# LifeByte Web Application

A Next.js 14+ powered web application for AI-powered health and fitness tracking.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Navigate to the web directory:
   ```bash
   cd apps/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
├── lib/               # Utility functions
│   └── utils.ts       # cn utility for class merging
└── utils/             # General utilities
```

## Configuration

The project includes:

- **TypeScript**: Strict mode enabled with proper paths mapping
- **Tailwind CSS**: Configured with Shadcn/ui theme
- **ESLint**: Core web vitals rules
- **PostCSS**: Autoprefixer configured
- **Shadcn/ui**: Ready for component installation

## Adding Components

To add Shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

## Environment Variables

This repo uses **root `.env` as the single source of truth**.

1) Copy and fill root env:

```bash
cp ../../.env.example ../../.env
```

2) Generate `apps/web/.env.local` from root `.env`:

```bash
bash ../../scripts/sync-env.sh
```

```env
# Generated file: apps/web/.env.local (do not edit by hand)
# See root .env.example for the full list of keys.
```