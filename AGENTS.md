# AutoServe — Cloud Workshop Management System

React + TypeScript + Vite + Tailwind CSS enterprise dashboard for automotive repair centers and spare parts inventory management.

## Project Structure

- `src/main.tsx` - Application entry point; mounts `src/App.tsx` and imports global styling
- `src/App.tsx` - Primary application component handling workspace routing and authentication states
- `src/index.css` - Global CSS styles and Tailwind CSS v4 setup
- `src/components/` - Application module screens (WorkOrders, Customers, Invoices, Warehouse, etc.)
- `src/data/` - Unified data layer, types, and GraphQL workspace API bindings
- `backend/` - ASP.NET Core 10 backend with PostgreSQL 17 and HotChocolate GraphQL
- `index.html` - HTML document shell
- `package.json` - Project dependencies and build scripts
- `vite.config.ts` - Vite configuration with Tailwind CSS v4 and React plugins

## Tech Stack & Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with `@tailwindcss/vite`
- Icons: Lucide React
- Backend: C# .NET 10, Entity Framework Core, PostgreSQL 17, HotChocolate GraphQL
- Mobile & Desktop Wrappers: Capacitor 8 & Tauri 2

## Development Scripts

- `npm run dev` - Launch local development server
- `npm run build` - Compile production bundles
- `npm run preview` - Preview production build locally
- `npm run android:sync` - Sync web assets with Capacitor Android project
- `npm run desktop:dev` - Run desktop application via Tauri
