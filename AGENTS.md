# FinanceOS - Agent Guidelines

## Project Overview
FinanceOS is a premium fintech dashboard built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Commands

### Development
- `npm run dev` — Start the Vite dev server
- `npm run build` — Build for production (runs `tsc && vite build`)
- `npm run preview` — Preview the production build locally

### Type Checking
- `npx tsc --noEmit` — Run TypeScript type checking

### Linting
- `npm run lint` — Run ESLint (if configured)

## Architecture

### Directory Structure
```
src/
├── app/
│   ├── providers/        # Context providers (Theme, Workspace)
│   └── store/            # Zustand state management
│       ├── index.ts      # Dashboard store (balance, bills, transactions, pockets)
│       └── notifications.ts  # Notification store
├── components/
│   ├── ui/               # Reusable UI components (Card, Badge, Button)
│   ├── Sidebar.tsx       # Fixed sidebar (do not modify)
│   ├── Header.tsx        # Top header with theme toggle
│   └── Layout.tsx        # Page layout wrapper
├── pages/
│   └── Dashboard/        # Dashboard page and sub-components
├── lib/
│   ├── types.ts          # Shared TypeScript types
│   ├── data.ts           # Mock data
│   └── utils.ts          # Utility functions
├── index.css             # Tailwind CSS + design tokens
└── main.tsx              # React entry point
```

### Key Contexts
- **ThemeContext** (`src/app/providers/ThemeContext.tsx`): Manages light/dark mode. Toggles via `useTheme()`.
- **WorkspaceContext** (`src/app/providers/WorkspaceContext.tsx`): Manages workspace selection (Sri Lanka / Indonesia). Provides currency, theme color, and warning thresholds.
- **Zustand Store** (`src/app/store/index.ts`): Manages financial data (balance, bills, pockets, transactions) using mock data.
- **Notification Store** (`src/app/store/notifications.ts`): Manages notifications.

### Workspace Configuration
| Workspace | Theme | Currency | Warning Threshold | Dashboard Content |
|-----------|-------|----------|-------------------|-------------------|
| Sri Lanka | Green | LKR | Rs 20,000 | Today's Transactions |
| Indonesia | Blue | IDR | Rp 5,000,000 | Money Pockets + Upcoming Bills |

### Design System
- **Dark Mode**: Premium dark fintech with glass cards, purple/blue gradients, soft shadows
- **Light Mode**: White cards, soft gray backgrounds, subtle borders
- **Workspace Themes**: Green for Sri Lanka, Blue for Indonesia
- **Animations**: Framer Motion with subtle fade/slide/hover effects
- **Glass Morphism**: Used for premium cards with `backdrop-blur`

### Component Guidelines
- Use `cn()` utility from `src/lib/utils.ts` for conditional class merging
- Use Framer Motion for subtle animations (fade, slide, hover lift)
- Use workspace-aware colors via `text-workspace`, `bg-workspace` CSS variables
- All components must work in both light and dark modes
