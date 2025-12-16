# Page Builder CMS - App

A modern, scalable React TypeScript application built with clean architecture principles.

## 🚀 Features

- ⚡ **Vite** - Lightning-fast development with HMR
- ⚛️ **React 18** - Latest React features
- 🔷 **TypeScript** - Full type safety
- 🚦 **TanStack Router** - Type-safe routing solution
- 🏗️ **Clean Architecture** - Organized, maintainable code structure
- 🎨 **Modern CSS** - Responsive design with CSS variables

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Basic UI elements (Button, Card, etc.)
│   └── common/      # Common components (Loading, ErrorBoundary)
├── features/        # Feature-specific modules
├── hooks/           # Custom React hooks
├── routes/          # TanStack Router route components
├── services/        # API and external services
├── types/           # TypeScript type definitions
├── utils/           # Helper functions and utilities
├── App.tsx          # Main App component
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ or higher
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm type-check
```

The development server will start at `http://localhost:3000`

## 🏗️ Architecture

### Clean Architecture Principles

- **Separation of Concerns**: Each layer has a specific responsibility
- **Dependency Rule**: Dependencies point inward toward business logic
- **Testability**: Easy to test each layer independently
- **Scalability**: Easy to add new features without affecting existing code

### Layers

1. **Components**: Presentation layer - UI components
2. **Features**: Feature modules - business logic and feature-specific code
3. **Services**: Data layer - API calls and external integrations
4. **Utils**: Helper functions and utilities
5. **Types**: Type definitions and interfaces

## 🚦 Routing

This project uses **TanStack Router** for type-safe routing:

- File-based routing in `/src/routes`
- Automatic route generation
- Type-safe navigation and params
- Built-in dev tools

### Creating New Routes

1. Create a new file in `src/routes/`
2. Export a route using `createFileRoute`
3. The route will be automatically registered

Example:
```tsx
// src/routes/users.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users')({
  component: UsersPage,
});

function UsersPage() {
  return <div>Users Page</div>;
}
```

## 🎨 Styling

- CSS variables for theming
- Responsive design
- Modern CSS features
- Component-scoped styles

## 📝 Code Organization Best Practices

1. **Components**: Keep components small and focused
2. **Hooks**: Extract reusable logic into custom hooks
3. **Types**: Define types in separate files
4. **Services**: Keep API logic separate from components
5. **Utils**: Create pure functions for common operations

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## 📚 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Router** - Routing
- **CSS3** - Styling

## 🤝 Contributing

1. Follow the established folder structure
2. Write TypeScript with proper types
3. Keep components small and reusable
4. Write self-documenting code
5. Test your changes

## 📄 License

ISC License
