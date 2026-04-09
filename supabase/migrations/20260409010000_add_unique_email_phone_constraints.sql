-- Prevent duplicate graduate contact details

CREATE UNIQUE INDEX IF NOT EXISTS idx_graduates_email_unique
  ON graduates (lower(trim(email)))
  WHERE trim(email) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_graduates_phone_unique
  ON graduates (trim(phone))
  WHERE trim(phone) <> '';
