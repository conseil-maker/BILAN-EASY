-- Table pour stocker les questionnaires de satisfaction
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  category_scores JSONB,
  global_score DECIMAL(3,2),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_satisfaction_user_id ON satisfaction_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_assessment_id ON satisfaction_surveys(assessment_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_submitted_at ON satisfaction_surveys(submitted_at);

-- RLS (Row Level Security)
ALTER TABLE satisfaction_surveys ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres questionnaires
CREATE POLICY "Users can view own surveys"
  ON satisfaction_surveys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer leurs propres questionnaires
CREATE POLICY "Users can create own surveys"
  ON satisfaction_surveys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins can view all surveys"
  ON satisfaction_surveys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE satisfaction_surveys IS 'Questionnaires de satisfaction Qualiopi';
COMMENT ON COLUMN satisfaction_surveys.answers IS 'Réponses au questionnaire (JSON)';
COMMENT ON COLUMN satisfaction_surveys.category_scores IS 'Scores par catégorie';
COMMENT ON COLUMN satisfaction_surveys.global_score IS 'Score global de satisfaction (1-5)';
