-- 1. Create Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add System Default Categories (user_id is NULL)
INSERT INTO categories (name, type, user_id) VALUES
('Food', 'expense', NULL),
('Transport', 'expense', NULL),
('Shopping', 'expense', NULL),
('Entertainment', 'expense', NULL),
('Rent', 'expense', NULL),
('Utilities', 'expense', NULL),
('Salary', 'income', NULL),
('Freelance', 'income', NULL),
('Investment', 'income', NULL);

-- 3. Enable RLS (Safety)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 4. Set Policies
CREATE POLICY "Public categories are viewable by everyone" 
ON categories FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON categories FOR DELETE USING (auth.uid() = user_id);
