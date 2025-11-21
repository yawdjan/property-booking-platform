
# Property Booking Main Backend

The main backend service for the Property Booking Platform. This service handles user authentication, agent management, bookings, calendar scheduling, commission calculation, property management and notifies clients and agents in real-time via WebSockets.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [API Overview](#api-overview)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Running Locally](#running-locally)
- [WebSocket Notifications](#websocket-notifications)
- [Testing & Linting](#testing--linting)
- [Contributing](#contributing)

## Features
- User registration, login and role-based authentication (agents, admins)
- Agent management and property administration
- Booking creation, confirmation and status flows
- Commission calculation and reporting
- Calendar endpoints for scheduling and availability
- Payment integration (delegates to Payment Backend)
- WebSocket-based real-time notifications

## Prerequisites
- Node.js v14+ (recommend latest LTS)
- MongoDB (local or hosted)
- Environment variables (see Configuration)

## Installation
1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root (see the Configuration section below).

## Configuration
Create a `.env` file in the project root and set the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYMENT_BACKEND_URL=https://your-payment-backend.example.com
PAYMENT_BACKEND_KEY=optional_api_key_or_token
WEBSOCKET_SECRET=optional_secret_for_ws
```

Adjust names/values to match your environment and deployment.

## Scripts
Common npm scripts (defined in `package.json`):

- `npm start` — start the server (production)
- `npm run dev` — start the server with `nodemon` for development
- `npm test` — placeholder for tests (if added)

## API Overview
This project exposes REST endpoints under `/api` grouped by resource. Below are the main routes and a short description of each.

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login and receive a JWT

- `GET /api/agents` — list agents
- `POST /api/agents` — create an agent

- `GET /api/properties` — list properties
- `POST /api/properties` — create a property

- `GET /api/bookings` — list bookings
- `POST /api/bookings` — create a booking (typically triggers payment link creation via Payment Backend)
- `GET /api/bookings/:id` — get booking details

- `GET /api/calendar` — calendar availability and bookings

- `GET /api/commissions` — list commissions and reports

Note: Each endpoint enforces validation and (where appropriate) authentication/authorization. See `src/middleware` for validation and auth logic.

## Architecture & Folder Structure
Key folders in `src/`:

- `config/` — configuration and database connection
- `controllers/` — request handlers for each route
- `models/` — Mongoose models (User, Booking, Property, Commission)
- `routes/` — route definitions that map endpoints to controllers
- `middleware/` — auth, validation and error handling middleware
- `utils/` — helpers (email, formatting, etc.)
- `websocket/` — WebSocket/socket.io integration and event handlers

This separation keeps controllers thin and delegates business logic to models and services.

## Running Locally
Start MongoDB (local or using a hosted service). Then run:

```bash
npm run dev
```

Open `http://localhost:3000` (or the `PORT` you configured) and use an API client (Postman / Insomnia) to test endpoints.

## WebSocket Notifications
The server includes WebSocket support to push real-time updates (e.g., booking confirmed, new commission). The socket handler lives in `src/websocket/socketHandler.js`. When a payment is confirmed by the Payment Backend, this service expects to receive a notification (HTTP) and will broadcast appropriate socket events to relevant connected clients.

## Testing & Linting
There are no tests configured by default. Add unit/integration tests and a test script in `package.json` as needed. Consider adding ESLint and Prettier for consistent style.

## Contributing
1. Fork the repo
2. Create a feature branch
3. Open a pull request with a clear description and tests (if applicable)

## Notes & Next Steps
- Add tests for controllers and services
- Add CI workflow (GitHub Actions) to run lint and tests
- Add OpenAPI/Swagger docs for the API

---

If you'd like, I can also:
- Generate a matching `docker-compose.yml` for local development (MongoDB + app)
- Add a Swagger/OpenAPI spec for the endpoints
- Add basic unit tests for one controller (booking or auth)

Happy to make any of those next improvements — tell me which one you'd like.


# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE property_booking;

# Create user (optional)
CREATE USER booking_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE property_booking TO booking_admin;

# Exit
\q