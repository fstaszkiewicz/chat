# Chat Application

A real-time chat application built with ASP.NET Core 8 Web API + SignalR on the backend and React + TypeScript on the frontend.

## Tech Stack

### Backend
- .NET 8
- ASP.NET Core Web API
- SignalR (real-time messaging)
- Entity Framework Core with PostgreSQL
- ASP.NET Core Identity (user management)
- JWT Authentication
- Swagger/OpenAPI

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- @microsoft/signalr (SignalR client)
- Axios (HTTP client)

### Database
- PostgreSQL 16

### Containerization
- Docker & Docker Compose

## Features

- User registration and login with JWT authentication
- Real-time chat messaging using SignalR
- Message persistence with PostgreSQL
- Fetches last 50 messages on login
- Clean, responsive UI

## Getting Started

### Prerequisites

- Docker and Docker Compose
- .NET 8 SDK (for local development)
- Node.js 18+ (for local development)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd chat
```

2. Start all services:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Swagger UI: http://localhost:5000/swagger

### Development Setup

For development with hot reload:

1. Start the development environment:
```bash
docker-compose -f docker-compose.dev.yml up
```

2. The frontend will be available at http://localhost:5173 with hot reload
3. The backend will be available at http://localhost:5000 with hot reload

### Manual Setup (without Docker)

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Start PostgreSQL (or use Docker):
```bash
docker run --name postgres -e POSTGRES_DB=chatdb -e POSTGRES_USER=chat -e POSTGRES_PASSWORD=chatpw -p 5432:5432 -d postgres:16
```

3. Restore packages and run migrations:
```bash
dotnet restore
dotnet ef database update --project Chat.Api
```

4. Run the backend:
```bash
dotnet run --project Chat.Api
```

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── backend/
│   ├── Chat.Api/
│   │   ├── Controllers/          # API Controllers (currently using minimal APIs)
│   │   ├── Hubs/                 # SignalR Hubs
│   │   ├── Data/                 # Entity Framework DbContext
│   │   ├── Models/               # Data Models
│   │   ├── DTOs/                 # Data Transfer Objects
│   │   ├── Program.cs            # Application entry point
│   │   ├── appsettings.json      # Configuration
│   │   └── Chat.Api.csproj       # Project file
│   └── Chat.sln                  # Solution file
├── frontend/
│   ├── src/
│   │   ├── api/                  # API clients
│   │   ├── components/           # React components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Page components
│   │   ├── types/                # TypeScript type definitions
│   │   ├── App.tsx               # Main App component
│   │   └── main.tsx              # Application entry point
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   └── vite.config.ts            # Vite configuration
├── docker-compose.yml            # Production Docker setup
├── docker-compose.dev.yml        # Development Docker setup
└── README.md                     # This file
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/messages` - Get last 50 messages
- `WS /hubs/chat` - SignalR chat hub

## Environment Variables

### Backend
- `ConnectionStrings__Default` - PostgreSQL connection string
- `Jwt__Key` - JWT signing key
- `Jwt__Issuer` - JWT issuer
- `Jwt__Audience` - JWT audience
- `FrontendUrl` - Frontend URL for CORS

### Frontend
- `VITE_API_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.