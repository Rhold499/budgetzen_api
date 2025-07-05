/*
  # Add budget management system

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique per tenant)
      - `description` (text)
      - `color` (text, default gray)
      - `icon` (text)
      - `type` (enum: INCOME, EXPENSE, BOTH)
      - `is_active` (boolean, default true)
      - `is_default` (boolean, default false)
      - `tenant_id` (uuid, foreign key)
      - `created_by_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `budgets`
      - `id` (uuid, primary key)
      - `amount` (decimal)
      - `currency` (text, default EUR)
      - `month` (integer, 1-12)
      - `year` (integer)
      - `spent` (decimal, default 0)
      - `is_active` (boolean, default true)
      - `alert_at` (decimal, percentage for alerts)
      - `tenant_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `created_by_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `goals`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `target_amount` (decimal)
      - `current_amount` (decimal, default 0)
      - `currency` (text, default EUR)
      - `target_date` (timestamp)
      - `status` (enum: ACTIVE, COMPLETED, PAUSED, CANCELLED)
      - `priority` (integer, 1=High, 2=Medium, 3=Low)
      - `is_public` (boolean, default false)
      - `metadata` (jsonb)
      - `tenant_id` (uuid, foreign key)
      - `created_by_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `goal_contributions`
      - `id` (uuid, primary key)
      - `amount` (decimal)
      - `description` (text)
      - `goal_id` (uuid, foreign key)
      - `transaction_id` (uuid, foreign key, nullable)
      - `created_at` (timestamp)

  2. Enums
    - CategoryType (INCOME, EXPENSE, BOTH)
    - GoalStatus (ACTIVE, COMPLETED, PAUSED, CANCELLED)

  3. Modifications
    - Add `category_id` to `transactions` table

  4. Security
    - Enable RLS on all new tables
    - Add policies for tenant isolation
*/

-- Create enums
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE', 'BOTH');
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#6B7280',
  icon text,
  type "CategoryType" DEFAULT 'BOTH',
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, name)
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(15,2) NOT NULL,
  currency text DEFAULT 'EUR',
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  spent decimal(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  alert_at decimal(5,2), -- Percentage (0.8 = 80%)
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(tenant_id, category_id, month, year)
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  target_amount decimal(15,2) NOT NULL,
  current_amount decimal(15,2) DEFAULT 0,
  currency text DEFAULT 'EUR',
  target_date timestamptz,
  status "GoalStatus" DEFAULT 'ACTIVE',
  priority integer DEFAULT 1 CHECK (priority >= 1 AND priority <= 3),
  is_public boolean DEFAULT false,
  metadata jsonb,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goal contributions table
CREATE TABLE IF NOT EXISTS goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(15,2) NOT NULL,
  description text,
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Add category_id to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Tenants can manage their categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for budgets
CREATE POLICY "Tenants can manage their budgets"
  ON budgets
  FOR ALL
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for goals
CREATE POLICY "Tenants can manage their goals"
  ON goals
  FOR ALL
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for goal_contributions
CREATE POLICY "Tenants can manage their goal contributions"
  ON goal_contributions
  FOR ALL
  TO authenticated
  USING (goal_id IN (
    SELECT id FROM goals WHERE tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_budgets_tenant_id ON budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);
CREATE INDEX IF NOT EXISTS idx_budgets_is_active ON budgets(is_active);

CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);

CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_transaction_id ON goal_contributions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);

-- Insert default categories for existing tenants
INSERT INTO categories (name, description, color, icon, type, is_default, tenant_id, created_by_id)
SELECT 
  category_data.name,
  category_data.description,
  category_data.color,
  category_data.icon,
  category_data.type::"CategoryType",
  true,
  t.id,
  (SELECT id FROM users WHERE tenant_id = t.id AND role IN ('ADMIN', 'SUPERADMIN') LIMIT 1)
FROM tenants t
CROSS JOIN (
  VALUES 
    ('Alimentation', 'Courses, restaurants, nourriture', '#10B981', '🍽️', 'EXPENSE'),
    ('Transport', 'Carburant, transports publics, véhicule', '#3B82F6', '🚗', 'EXPENSE'),
    ('Logement', 'Loyer, charges, entretien', '#8B5CF6', '🏠', 'EXPENSE'),
    ('Santé', 'Médecin, pharmacie, assurance santé', '#EF4444', '⚕️', 'EXPENSE'),
    ('Loisirs', 'Sorties, hobbies, vacances', '#F59E0B', '🎉', 'EXPENSE'),
    ('Éducation', 'Formation, livres, cours', '#06B6D4', '📚', 'EXPENSE'),
    ('Salaire', 'Revenus du travail', '#10B981', '💰', 'INCOME'),
    ('Investissements', 'Dividendes, plus-values', '#8B5CF6', '📈', 'INCOME'),
    ('Autres revenus', 'Revenus divers', '#6B7280', '💼', 'INCOME'),
    ('Épargne', 'Mise de côté, placements', '#059669', '🏦', 'BOTH')
) AS category_data(name, description, color, icon, type)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c 
  WHERE c.tenant_id = t.id AND c.name = category_data.name
);