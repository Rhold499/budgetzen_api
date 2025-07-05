/*
  # Add webhook and banking tables

  1. New Tables
    - `webhook_subscriptions`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key)
      - `url` (text)
      - `events` (jsonb)
      - `secret` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `webhook_deliveries`
      - `id` (uuid, primary key)
      - `subscription_id` (uuid, foreign key)
      - `event_id` (text)
      - `status` (text)
      - `error_message` (text)
      - `created_at` (timestamp)
    
    - `bank_connections`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key)
      - `bank_name` (text)
      - `account_number` (text)
      - `connection_type` (text)
      - `credentials` (jsonb)
      - `is_active` (boolean)
      - `last_sync` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for tenant isolation
*/

-- Webhook subscriptions table
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url text NOT NULL,
  events jsonb NOT NULL DEFAULT '[]',
  secret text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Webhook deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Bank connections table
CREATE TABLE IF NOT EXISTS bank_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_number text,
  connection_type text NOT NULL CHECK (connection_type IN ('open_banking', 'scraping', 'manual')),
  credentials jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_subscriptions
CREATE POLICY "Tenants can manage their webhook subscriptions"
  ON webhook_subscriptions
  FOR ALL
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for webhook_deliveries
CREATE POLICY "Tenants can view their webhook deliveries"
  ON webhook_deliveries
  FOR SELECT
  TO authenticated
  USING (subscription_id IN (
    SELECT id FROM webhook_subscriptions WHERE tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  ));

-- RLS Policies for bank_connections
CREATE POLICY "Tenants can manage their bank connections"
  ON bank_connections
  FOR ALL
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_tenant_id ON webhook_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_events ON webhook_subscriptions USING GIN(events);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_subscription_id ON webhook_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_bank_connections_tenant_id ON bank_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_is_active ON bank_connections(is_active);