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

Create a `.env.local` file in the root of `apps/web` for environment-specific variables:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_APP_NAME=LifeByte
```