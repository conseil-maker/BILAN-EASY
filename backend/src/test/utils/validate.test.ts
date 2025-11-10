import { describe, it, expect } from 'vitest';
import { createAssessmentSchema, updateAssessmentSchema, createAnswerSchema, createSummarySchema } from '../../utils/validate.js';

describe('Validation Schemas', () => {
  describe('createAssessmentSchema', () => {
    it('should validate valid assessment data', () => {
      const validData = {
        userName: 'Test User',
        packageId: 'decouverte',
        packageName: 'Découverte',
        coachingStyle: 'collaborative',
        totalQuestions: 10,
      };

      expect(() => createAssessmentSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid packageId', () => {
      const invalidData = {
        userName: 'Test User',
        packageId: 'invalid',
        packageName: 'Découverte',
        coachingStyle: 'collaborative',
        totalQuestions: 10,
      };

      expect(() => createAssessmentSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        userName: 'Test User',
        // Missing packageId
      };

      expect(() => createAssessmentSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createAnswerSchema', () => {
    it('should validate valid answer data', () => {
      const validData = {
        questionId: 'question-1',
        questionTitle: 'Test Question',
        questionType: 'PARAGRAPH',
        value: 'Test Answer',
      };

      expect(() => createAnswerSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid questionType', () => {
      const invalidData = {
        questionId: 'question-1',
        questionTitle: 'Test Question',
        questionType: 'INVALID',
        value: 'Test Answer',
      };

      expect(() => createAnswerSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createSummarySchema', () => {
    it('should validate valid summary data', () => {
      const validData = {
        profileType: 'Test Profile',
        priorityThemes: ['Theme 1'],
        maturityLevel: 'Intermediate',
        keyStrengths: [],
        areasForDevelopment: [],
        recommendations: [],
        actionPlan: {
          shortTerm: [],
          mediumTerm: [],
        },
      };

      expect(() => createSummarySchema.parse(validData)).not.toThrow();
    });
  });
});

