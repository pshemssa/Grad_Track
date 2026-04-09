-- Add dedicated further study fields for graduates pursuing more education

ALTER TABLE graduates
  ADD COLUMN IF NOT EXISTS further_study_location text DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS further_study_country text DEFAULT '',
  ADD COLUMN IF NOT EXISTS further_study_field text DEFAULT '',
  ADD COLUMN IF NOT EXISTS further_study_graduation_year int,
  ADD COLUMN IF NOT EXISTS further_study_funding text DEFAULT 'self_funded';
