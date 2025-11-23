# Full-Stack Template Documentation

A production-ready full-stack application template with React frontend and Express.js backend, featuring Docker containerization, automated deployment, and modern development tools.

## 🚀 Features

### Backend
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** with Mongoose - Database with ODM
- **JWT Authentication** - Secure token-based authentication
- **BullMQ** - Job queue system with Redis
- **Cloudinary** - Image and file upload service
- **Razorpay** - Payment gateway integration
- **Resend** - Email service
- **Winston** - Logging with Loki integration
- **Prometheus Metrics** - Application monitoring
- **Cron Jobs** - Scheduled task execution
- **Zod** - Schema validation
- **Docker** - Containerized deployment

### Frontend
- **React 19** - Latest React with React Compiler
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client with automatic token handling
- **ESLint** - Code linting
- **Docker + Nginx** - Production-ready containerization

### Infrastructure
- **Docker Compose** - Multi-container orchestration
- **Traefik** - Reverse proxy with automatic SSL
- **GitHub Actions** - CI/CD pipeline
- **Environment-based configuration**

## 📁 Project Structure

```
full-stack-template/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── Dockerfile         # Frontend container config
│   ├── nginx.conf         # Nginx configuration
│   └── package.json
│
├── server/                # Express.js backend application
│   ├── src/
│   │   ├── app.js         # Express app setup
│   │   ├── index.js       # Server entry point
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Custom middlewares
│   │   ├── utils/         # Utility functions
│   │   ├── db/            # Database connection
│   │   ├── queue/         # BullMQ job queues
│   │   └── crons/         # Scheduled jobs
│   ├── Dockerfile         # Backend container config
│   └── package.json
│
├── docs/                  # Documentation
│   ├── README.md          # This file
│   ├── client/            # Client documentation
│   └── server/            # Server documentation
│
├── docker-compose.yml     # Docker orchestration
└── .gitignore
```

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **MongoDB** (local or cloud instance)
- **Redis** (for job queues)
- Accounts for:
  - Cloudinary (for file uploads)
  - Razorpay (for payments)
  - Resend (for emails)

## ⚙️ Environment Variables

### Server Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=3000
SERVER_NAME=MyApp
BACKEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/myapp

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
COOKIE_NAME=accessToken

# CORS
CORS_ORIGIN=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Resend
RESEND_API_KEY=your-resend-api-key

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging (optional)
LOKI_URL=http://localhost:3100
```

### Client Environment Variables

Create a `.env` file in the `client/` directory (if needed):

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd full-stack-template
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   - Create `server/.env` with your configuration
   - Create `client/.env` if needed

4. **Start MongoDB and Redis**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   docker run -d -p 6379:6379 --name redis redis:latest
   
   # Or use your local installations
   ```

5. **Run the development servers**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend
   cd client
   npm run dev
   ```

   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173

### Docker Development

1. **Build and start containers**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Backend: http://localhost:3000
   - Frontend: http://localhost:80

### Production Deployment

1. **Update docker-compose.yml**
   - Modify Traefik labels with your domain names
   - Update network configuration if needed

2. **Set up Traefik** (if using reverse proxy)
   - Ensure Traefik is running and connected to the `web` network
   - Configure Let's Encrypt certificate resolver

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

4. **GitHub Actions** (if configured)
   - Push to main branch triggers automatic deployment
   - Ensure secrets are configured in GitHub repository

## 📝 Available Scripts

### Server Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Client Scripts
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🏗️ Architecture

### Backend Architecture
- **MVC Pattern** - Controllers, Models, Routes separation
- **Middleware Chain** - Authentication, metrics, file upload
- **Job Queue** - Background task processing with BullMQ
- **Cron Jobs** - Scheduled tasks (e.g., subscription updates)
- **Error Handling** - Centralized error handling with asyncHandler
- **API Response** - Standardized response format

### Frontend Architecture
- **Component-based** - React functional components
- **Routing** - React Router for navigation
- **API Integration** - Axios for HTTP requests with automatic token handling
- **Build Optimization** - Vite for fast builds

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Cookie-based token storage
- Environment variable protection
- Input validation with Zod

## 📊 Monitoring

- **Prometheus Metrics** - Available at `/metrics` endpoint
- **Health Check** - Available at `/api/v1/health` endpoint
- **Winston Logging** - Structured logging with Loki integration

## 🧪 Testing

Add your test files in:
- `server/__tests__/` for backend tests
- `client/__tests__/` for frontend tests

## 📦 Deployment

### Docker Deployment
The template includes Dockerfiles for both client and server:
- **Server**: Node.js runtime with production optimizations
- **Client**: Nginx serving static files

### CI/CD
GitHub Actions workflow is configured for automated deployment (see `.github/workflows/deploy.yml`)

## 📚 Additional Documentation

- **[Client Setup](client/README.md)** - React + Vite setup guide
- **[API Integration](client/api-integration.md)** - API integration with automatic token handling
- **[Server Documentation](server/)** - Backend-specific documentation (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Express.js community
- React team
- Vite team
- All open-source contributors

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Happy Coding! 🚀**
