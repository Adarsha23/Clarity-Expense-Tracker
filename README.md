# Clarity - Personal Expense Tracker

A modern, full-stack expense tracking application built with React, TypeScript, Node.js, and Supabase.

## 🚀 Features

### Core Features
- ✅ User authentication (signup/login)
- ✅ Add, edit, and delete transactions (income/expense)
- ✅ Transaction list with filtering (category, date range)
- ✅ Dashboard with spending analytics
- ✅ Responsive design (mobile + desktop)

### Standout Features
- 📸 **Receipt OCR**: Upload receipt photos to auto-fill transaction details
- 📊 **Savings Projection**: Estimate how long your savings will last based on spending trends
- 💡 **Counterfactual Analysis**: See what you could have bought/saved if you skipped certain purchases
- 🎯 **Goal Velocity Tracker**: Monitor progress toward savings goals with velocity metrics

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- React Router (routing)
- Axios (HTTP client)
- React Query (server state management)

**Backend:**
- Node.js with Express
- TypeScript
- Supabase (PostgreSQL database + authentication)

**Deployment:**
- Frontend: Vercel
- Backend: Integrated with Supabase
- Database: Supabase (PostgreSQL)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Git

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Adarsha23/Clarity-Expense-Tracker.git
cd Clarity-Expense-Tracker
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);

-- Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

3. Copy your **Project URL** and **anon public key** from **Settings > API**

### 3. Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
```

**Frontend:**
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

### 4. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 5. Run the Application

**Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3001`

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### 6. Access the App

Open your browser to [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
clarity-expense-tracker/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API communication
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, validation
│   │   ├── services/     # Business logic
│   │   ├── config/       # Configuration
│   │   └── server.ts     # Express server
│   └── package.json
│
└── README.md
```

## 🔐 Authentication Flow

1. User signs up with email/password
2. Supabase creates user account and returns JWT token
3. Frontend stores token in localStorage
4. All API requests include token in `Authorization` header
5. Backend middleware verifies token with Supabase
6. Database RLS policies ensure users only access their own data

## 🧪 Testing

**Backend API:**
```bash
# Test signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📚 API Documentation

### Authentication

**POST** `/api/auth/signup`
- Body: `{ email: string, password: string }`
- Returns: `{ user, session }`

**POST** `/api/auth/login`
- Body: `{ email: string, password: string }`
- Returns: `{ user, session }`

**POST** `/api/auth/logout`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ message: "Logged out" }`

### Transactions

**GET** `/api/transactions`
- Headers: `Authorization: Bearer <token>`
- Query: `?category=Food&startDate=2026-01-01&endDate=2026-01-31`
- Returns: `{ transactions: [...] }`

**POST** `/api/transactions`
- Headers: `Authorization: Bearer <token>`
- Body: `{ type, amount, category, description, date }`
- Returns: `{ transaction }`

**PUT** `/api/transactions/:id`
- Headers: `Authorization: Bearer <token>`
- Body: `{ amount?, category?, description?, date? }`
- Returns: `{ transaction }`

**DELETE** `/api/transactions/:id`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ message: "Deleted" }`

### Dashboard

**GET** `/api/dashboard`
- Headers: `Authorization: Bearer <token>`
- Query: `?startDate=2026-02-01&endDate=2026-02-28`
- Returns: `{ totalIncome, totalExpenses, balance, categoryBreakdown }`

## 🎨 Design Decisions

**Why TypeScript?**
- Type safety prevents runtime errors
- Better IDE autocomplete and refactoring
- Shared types between frontend and backend

**Why Supabase?**
- Production-ready authentication out of the box
- PostgreSQL with built-in Row Level Security
- Real-time capabilities (future enhancement)
- Generous free tier

**Why separate backend?**
- Business logic separation from UI
- Easier to add server-side features (OCR processing, analytics)
- Can scale independently from frontend

## 🚧 Future Enhancements

- Email verification and password reset
- Export transactions to CSV
- Recurring transactions
- Budget limits with notifications
- Multi-currency support
- Dark mode

## 👨‍💻 Author

Built by Adarsha Prasai for Software Engineer Intern assessment

## 📄 License

MIT
