# Clarity - Personal Expense Tracker

A modern, full-stack financial management application designed to help you track expenses, visualize spending habits, and forecast savings. Built with **React**, **TypeScript**, **Node.js**, and **Supabase**.

---

## Key Features

### Smart Dashboard
- **Financial Overview**: Instantly view your Total Income, Total Expenses, and Net Balance.
- **Visual Analytics**:
  - **Spending Distribution**: Interactive Pie Chart showing exactly where your money goes.
  - **Savings Trend**: Line chart tracking your savings growth over time.
- **Savings Projection**: AI-driven "Runway" calculation estimating how long your savings will last based on current spending.

### Transaction Management
- **Unified UI**: Consistent, clean modal interface for adding Income and Expenses.
- **Custom Categories**: Create, edit, and manage your own transaction categories directly from the modal.
- **Advanced Filtering**: Filter transactions by specific **Date Ranges** or view by **Month**.
- **Contextual Insights**: Monthly summaries showing precise savings or deficits.

### Secure & Robust
- **Authentication**: Secure Signup and Login powered by Supabase Auth.
- **Data Privacy**: Row Level Security (RLS) ensures you only access your own data.

### Standout Features
- **Visual Analytics**: Interactive pie charts for category spending and line charts for savings trends.
- **Savings Projection**: AI-assisted forecasting to estimate how long your savings will last.

---

## Tech Stack

| Area | Technologies |
|------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Recharts, Axios, React Router, React Hot Toast |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | Supabase (PostgreSQL), Row Level Security (RLS) |
| **Styling** | Vanilla CSS (Modern Variables & Responsive Design) |

---

## Prerequisites

Before running the project, ensure you have:
- **Node.js** (v18 or higher)
- **npm** (Node Package Manager)
- A **Supabase** account (Free tier is sufficient)
- **Git**

---

## Installation & Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Adarsha23/Clarity-Expense-Tracker.git
cd Clarity-Expense-Tracker
```

### 2. Set Up Supabase (Database)
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the following SQL script to set up your tables and security policies:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (Optional, for future extensibility)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for default categories
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Transactions Table
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

-- 4. Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies for Transactions (User can only see their own)
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- 6. Create Policies for Categories (User sees defaults + their own)
CREATE POLICY "Users can view default and own categories" ON categories FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- 7. Insert Default Categories
INSERT INTO categories (name, type, user_id) VALUES
('Salary', 'income', NULL), ('Freelance', 'income', NULL), ('Investment', 'income', NULL),
('Food', 'expense', NULL), ('Rent', 'expense', NULL), ('Utilities', 'expense', NULL),
('Transportation', 'expense', NULL), ('Entertainment', 'expense', NULL), ('Health', 'expense', NULL);
```

### 3. Configure Environment Variables

#### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file:
   ```bash
   touch .env
   ```
3. Add the following keys (get these from Supabase Settings > API):
   ```env
   SUPABASE_URL=your_project_url_here
   SUPABASE_ANON_KEY=your_anon_public_key_here
   PORT=3001
   NODE_ENV=development
   ```

#### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Create a `.env` file:
   ```bash
   touch .env
   ```
3. Add the following keys:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
   VITE_API_URL=http://localhost:3001
   ```

### 4. Install Dependencies
Install packages for both frontend and backend:

```bash
# In /backend
npm install

# In /frontend
npm install
```

---

## Running the Application

You will need to run the **Backend** and **Frontend** in separate terminal windows.

**Terminal 1: Start Backend**
```bash
cd backend
npm run dev
```
*Server runs on: http://localhost:3001*

**Terminal 2: Start Frontend**
```bash
cd frontend
npm run dev
```
*App runs on: http://localhost:5173*

Open **http://localhost:5173** in your browser to start using Clarity!

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/auth/signup` | Register a new user |
| **POST** | `/api/auth/login` | Login user & get JWT |
| **GET** | `/api/transactions` | Fetch all user transactions |
| **POST** | `/api/transactions` | Create a transaction |
| **GET** | `/api/categories` | Fetch categories (default + custom) |
| **POST** | `/api/categories` | Create a custom category |

---

## Author
**Adarsha Prasai**
Built for Software Engineer Intern Accessment.

## License
MIT

