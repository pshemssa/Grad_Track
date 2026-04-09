-- Add separate O-Level and A-Level school name fields for graduate records

ALTER TABLE graduates
  ADD COLUMN IF NOT EXISTS secondary_o_level_school text DEFAULT '',
  ADD COLUMN IF NOT EXISTS secondary_a_level_school text DEFAULT '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'graduates'
      AND column_name = 'secondary_school'
  ) THEN
    EXECUTE '
      UPDATE graduates
      SET secondary_o_level_school = COALESCE(NULLIF(secondary_o_level_school, ''''), secondary_school, '''')
      WHERE COALESCE(secondary_o_level_school, '''') = ''''
    ';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'graduates'
      AND column_name = 'secondary_o_level'
  ) THEN
    EXECUTE '
      UPDATE graduates
      SET secondary_o_level_school = COALESCE(NULLIF(secondary_o_level_school, ''''), secondary_o_level, '''')
      WHERE COALESCE(secondary_o_level_school, '''') = ''''
    ';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'graduates'
      AND column_name = 'secondary_a_level'
  ) THEN
    EXECUTE '
      UPDATE graduates
      SET secondary_a_level_school = COALESCE(NULLIF(secondary_a_level_school, ''''), secondary_a_level, '''')
      WHERE COALESCE(secondary_a_level_school, '''') = ''''
    ';
  END IF;
END $$;
