# PageBuilder CMS

Custom field page builder with visual layout editing capabilities.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Start all services
pnpm docker:dev:up

# Access applications
# - Host Root: http://localhost:3000
# - Render Root: http://localhost:3001
# - Database: localhost:5432

# View logs
pnpm docker:dev:logs

# Stop services
pnpm docker:dev:down
```

### Prerequisites

- Docker Desktop 24.0+
- 8GB RAM minimum
- 20GB free disk space

## 📁 Project Structure

```
page-builder-cms/
├── apps/
│   ├── host-root/          # Main admin/builder application
│   └── render-root/        # Page rendering application
├── packages/
│   ├── config/             # Shared configurations
│   │   ├── eslint/
│   │   ├── tailwind/
│   │   ├── tsconfig/
│   │   ├── tsup/
│   │   └── vitest/
│   ├── core/
│   │   ├── api-types/      # Shared API types
│   │   └── ui/             # Shared UI components
│   └── utils/              # Shared utilities
├── .containers/
│   ├── dev/                # Development Docker configs
│   │   ├── frontend/
│   │   ├── database/
│   │   └── docker-compose.yml
│   └── prod/               # Production Docker configs
└── docs/
    └── ai/                 # AI-assisted development docs
```

## 🛠️ Available Scripts

### Docker Commands

| Command                   | Description                   |
| ------------------------- | ----------------------------- |
| `pnpm docker:dev:up`      | Start development environment |
| `pnpm docker:dev:down`    | Stop all services             |
| `pnpm docker:dev:logs`    | View container logs           |
| `pnpm docker:dev:clean`   | Clean up and reset            |
| `pnpm docker:dev:build`   | Rebuild images                |
| `pnpm docker:dev:restart` | Restart services              |

### Development Commands

| Command       | Description                        |
| ------------- | ---------------------------------- |
| `pnpm dev`    | Start dev servers (without Docker) |
| `pnpm build`  | Build all packages                 |
| `pnpm lint`   | Lint all packages                  |
| `pnpm test`   | Run tests                          |
| `pnpm format` | Format code                        |

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines
- [docs/ai/](./docs/ai/) - Feature documentation

## 🐳 Docker Services

The development environment includes:

- **PostgreSQL 18** - Database with sample data
- **host-root** - Admin/builder interface (port 3000)
- **render-root** - Page renderer (port 3001)

All services include hot-reload and are fully configured for development.

## 🔧 Tech Stack

- **Frontend**: React 19, Vite, TanStack Router, Tailwind CSS
- **Backend**: Node.js 18, PostgreSQL 18
- **Build**: Turborepo, pnpm workspaces, tsup
- **Testing**: Vitest, Testing Library
- **DevOps**: Docker, Docker Compose

## 📝 License

ISC
