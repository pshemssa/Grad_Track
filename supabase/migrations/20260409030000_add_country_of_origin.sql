-- Add country of origin to support foreign student mobility tracking

ALTER TABLE graduates
  ADD COLUMN IF NOT EXISTS country_of_origin text DEFAULT '';
