-- Migration: Add question description and choices to answers table
-- Date: 2024-11-11
-- Description: Adds questionDescription and questionChoices columns to store complete question information with answers

-- Add question_description column
ALTER TABLE answers 
ADD COLUMN IF NOT EXISTS question_description TEXT;

-- Add question_choices column (JSONB for multiple choice options)
ALTER TABLE answers 
ADD COLUMN IF NOT EXISTS question_choices JSONB;

-- Add comment for documentation
COMMENT ON COLUMN answers.question_description IS 'Soru açıklaması/detayı (question.description)';
COMMENT ON COLUMN answers.question_choices IS 'Multiple choice seçenekleri (question.choices array)';

