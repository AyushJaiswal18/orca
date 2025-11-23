# Full-Stack Template

A production-ready full-stack application template with React frontend and Express.js backend, featuring Docker containerization, automated deployment, and modern development tools.

## 📚 Documentation

All documentation is organized in the `docs/` folder:

- **[Getting Started](docs/README.md)** - Complete setup and usage guide
- **[Client Documentation](docs/client/)** - Frontend-specific documentation
  - [Client Setup](docs/client/README.md) - React + Vite setup guide
  - [API Integration](docs/client/api-integration.md) - API integration with automatic token handling
- **[Server Documentation](docs/server/)** - Backend-specific documentation (coming soon)

## Quick Start

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start development servers
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

For detailed setup instructions, see [docs/README.md](docs/README.md).

## Features

- **Backend**: Express.js, MongoDB, JWT Auth, BullMQ, Cloudinary, Razorpay
- **Frontend**: React 19, Vite, React Router, Axios with auto token handling
- **Infrastructure**: Docker, Docker Compose, Traefik, GitHub Actions
- **Container Management**: AWS ECS Fargate integration for multi-region container deployment
- **KasmWebspaces Support**: Launch KasmWebspaces containers across multiple AWS regions

## KasmWebspaces Multi-Region Support

The platform now supports launching KasmWebspaces containers across multiple AWS regions.

- **Quick Start**: See [docs/QUICK_START_KASMWEBSPACES.md](docs/QUICK_START_KASMWEBSPACES.md)
- **Full Setup Guide**: See [docs/KASMWEBSPACES_SETUP.md](docs/KASMWEBSPACES_SETUP.md)
- **Implementation Status**: See [KASMWEBSPACES_IMPLEMENTATION.md](KASMWEBSPACES_IMPLEMENTATION.md)

---

**Happy Coding! 🚀**

