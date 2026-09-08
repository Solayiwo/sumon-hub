# SuMon Hub 🛍️

SuMon Hub is a full-stack e-commerce prototype for browsing technology products, managing a persistent shopping cart, checking out, and viewing order history.

## Features

- Browse products by category and search term
- View product details, pricing, brand, stock, and description
- Filter and paginate the product catalogue
- Add products to a cart and change quantities
- Persist cart contents in the browser with `localStorage`
- Register and log in with JWT-based authentication
- Complete checkout with shipping and tax calculations
- Save orders and order items to MySQL
- Validate stock and decrement inventory atomically during checkout
- View authenticated order history

## Technology Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Shadcn UI components
- Axios and Lucide React

### Backend

- Node.js
- Express 5
- MySQL2 connection pool
- JSON REST API
- JWT authentication
- Bcrypt password hashing

### Database

The relational data model uses these entities:

- `Users`
- `Categories`
- `Products`
- `Orders`
- `Order_Items`

Orders and inventory changes are processed in a MySQL transaction. Product rows are locked while stock is checked to reduce inventory race conditions.

## Project Structure

```text
sumon-hub/
├── backend/
│   ├── db/              # Database connection and SQL schema
│   ├── models/          # User, product, and order data access
│   ├── routes/          # Authentication, product, and order routes
│   ├── seed.js          # Sample categories and product data
│   └── server.js        # Express server entry point
├── frontend/
│   ├── src/api/         # API client and endpoint helpers
│   ├── src/components/  # Reusable UI and feature components
│   ├── src/context/     # Authentication and cart state
│   ├── src/pages/       # Application pages
│   └── src/App.jsx      # Application routes and providers
├── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL 8 or a compatible MySQL server

## Installation

Clone the repository and install dependencies in both applications:

```bash
git clone <repository-url>
cd sumon-hub

cd backend
npm install

cd ../frontend
npm install
```

## Database Setup

1. Start MySQL.
2. Create the database and tables using `backend/db/schema.sql`.
3. Configure the backend environment variables before running the seed script.
4. Seed the sample categories and products:

```bash
cd backend
npm run seed
```

The seed script clears existing order, product, and category data before inserting the sample catalogue. Do not run it against data that must be preserved.


## Environment Variables

Create `backend/.env` with values for the local MySQL instance:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sumonhub_db
JWT_SECRET=replace_with_a_long_random_secret
```

The frontend uses Vite's `/api` proxy and therefore works without a frontend environment file during local development. For a separately hosted API, create `frontend/.env` and set:

```env
VITE_API_BASE_URL=https://your-api-host.example/api
```

Do not commit real passwords, JWT secrets, or other credentials.

## Running the Application

Run the backend in one terminal:

```bash
cd backend
npm run dev
```

Run the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Other useful commands:

```bash
# Backend production-style start
cd backend && npm start

# Frontend production build and preview
cd frontend && npm run build
cd frontend && npm run preview

# Frontend linting
cd frontend && npm run lint
```


## API Endpoints

The API is served under `/api`

| Method | Endpoint             | Description                                                      | Authentication  |
| :----: | -------------------- | ---------------------------------------------------------------- | --------------- |
|  `GET` | `/api/health`        | Check server status                                              | ❌ None          |
|  `GET` | `/api/products`      | List products; supports `category` and `q` query parameters      | ❌ None          |
|  `GET` | `/api/products/:id`  | Get a single product                                             | ❌ None          |
| `POST` | `/api/auth/register` | Create a user and return a JWT                                   | ❌ None          |
| `POST` | `/api/auth/login`    | Authenticate a user and return a JWT                             | ❌ None          |
|  `GET` | `/api/orders`        | Get the authenticated user's order history                       | 🔐 Bearer Token |
| `POST` | `/api/orders`        | Create an order and update stock; stock is validated server-side | 🔐 Bearer Token (Client user data; stock is validated server-side) |


## Architecture and Data Design

The React frontend communicates with the Express backend using asynchronous JSON requests. Express handles validation, authentication, and business logic before accessing MySQL through a connection pool.

The cart is intentionally client-side for this prototype: React Context manages the current cart and `localStorage` preserves it across browser refreshes. Completed orders are durable server-side records. At checkout, the backend validates every product and quantity, locks the relevant product rows, writes the order and order items, decrements stock, and commits the transaction. Any failure rolls the operation back.

JWTs provide stateless authentication for protected order-history requests. Passwords are stored as bcrypt hashes, never as plain text.

## Current Scope

Implemented:

- Product discovery and details
- Cart management
- Authentication
- Checkout and order persistence
- Inventory validation
- Order history

Not included in this prototype:

- Real payment processing
- An admin dashboard
- Product reviews and ratings
- Promo-code calculation
- Account profile editing

## 📌 Project Status

Phase 2 prototype: the core shopping flow is implemented and documented. The project is intended for local development and demonstration rather than production deployment.
