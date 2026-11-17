-- ============================================
-- ABF Event Forms & Applications Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add new columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS meet_link TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS president_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS president_image TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS whatsapp_link TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS email_from_name TEXT DEFAULT 'Glory Adeniran';

-- 2. Event forms table — one form per event
CREATE TABLE IF NOT EXISTS event_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Registration Form',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_forms_event_id ON event_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_event_forms_status ON event_forms(status);

-- 3. Form fields table — dynamic fields per form
CREATE TABLE IF NOT EXISTS form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES event_forms(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'phone', 'number', 'textarea', 'select', 'date', 'url', 'file')),
  required BOOLEAN NOT NULL DEFAULT TRUE,
  options JSONB DEFAULT NULL,
  placeholder TEXT DEFAULT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_order ON form_fields(form_id, display_order);

-- 4. Form responses table — submitted applications
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES event_forms(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT NULL,
  responses JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_event_id ON form_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_email ON form_responses(email);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted ON form_responses(submitted_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE event_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies — admin service role bypasses RLS via createAdminClient
-- Service role (admin) full access
CREATE POLICY "Service role full access on event_forms"
  ON event_forms FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on form_fields"
  ON form_fields FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on form_responses"
  ON form_responses FOR ALL
  USING (true) WITH CHECK (true);

-- 7. Updated_at trigger function (reuse existing if available)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_event_forms_updated_at ON event_forms;
CREATE TRIGGER trg_event_forms_updated_at
  BEFORE UPDATE ON event_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_form_fields_updated_at ON form_fields;
CREATE TRIGGER trg_form_fields_updated_at
  BEFORE UPDATE ON form_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_form_responses_updated_at ON form_responses;
CREATE TRIGGER trg_form_responses_updated_at
  BEFORE UPDATE ON form_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
