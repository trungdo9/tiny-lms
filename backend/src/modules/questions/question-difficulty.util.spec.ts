import { BadRequestException } from '@nestjs/common';
import {
  normalizeQuestionDifficulty,
  normalizeQuestionDifficultyList,
  normalizeOptionalQuestionDifficulty,
  isCanonicalQuestionDifficulty,
  CANONICAL_QUESTION_DIFFICULTIES,
  QUESTION_DIFFICULTY_ALIAS_MAP,
} from './question-difficulty.util';

describe('Question Difficulty Normalization', () => {
  describe('normalizeQuestionDifficulty', () => {
    describe('canonical values', () => {
      it('should return "easy" for "easy"', () => {
        expect(normalizeQuestionDifficulty('easy')).toBe('easy');
      });

      it('should return "medium" for "medium"', () => {
        expect(normalizeQuestionDifficulty('medium')).toBe('medium');
      });

      it('should return "hard" for "hard"', () => {
        expect(normalizeQuestionDifficulty('hard')).toBe('hard');
      });
    });

    describe('alias mapping', () => {
      describe('easy aliases', () => {
        it.each(['beginner', 'Beginner', 'BEGINNER'])('should map "%s" to "easy"', (input) => {
          expect(normalizeQuestionDifficulty(input)).toBe('easy');
        });

        it.each(['basic', 'Basic', 'BASIC'])('should map "%s" to "easy"', (input) => {
          expect(normalizeQuestionDifficulty(input)).toBe('easy');
        });
      });

      describe('medium aliases', () => {
        it.each(['intermediate', 'Intermediate', 'INTERMEDIATE'])('should map "%s" to "medium"', (input) => {
          expect(normalizeQuestionDifficulty(input)).toBe('medium');
        });

        it.each(['normal', 'Normal', 'NORMAL'])('should map "%s" to "medium"', (input) => {
          expect(normalizeQuestionDifficulty(input)).toBe('medium');
        });

        it.each(['avg', 'Avg', 'AVG'])('should map "%s" to "medium"', (input) => {
          expect(normalizeQuestionDifficulty(input)).toBe('medium');
        });

        it.each(['average', 'Average', 'AVERAGE'])('should map "%s" to "medium"', (input) => {
          expect(normalizeQuestionDifficulty(input)).toBe('medium');
        });
      });

      describe('hard aliases', () => {
        it.each(['advanced', 'Advanced', 'ADVANCED'])('should map "%s" to "hard"', (input) => {
          expect(normalizeQuestionDifficulty(input)).toBe('hard');
        });

        it.each(['difficult', 'Difficult', 'DIFFICULT'])('should map "%s" to "hard"', (input) => {
          expect(normalizeQuestionDifficulty(input)).toBe('hard');
        });
      });
    });

    describe('whitespace handling', () => {
      it('should trim whitespace', () => {
        expect(normalizeQuestionDifficulty('  easy  ')).toBe('easy');
      });

      it('should handle leading/trailing whitespace with aliases', () => {
        expect(normalizeQuestionDifficulty('  beginner  ')).toBe('easy');
      });
    });

    describe('null and undefined handling', () => {
      it('should throw BadRequestException for undefined without defaultValue', () => {
        expect(() => normalizeQuestionDifficulty(undefined)).toThrow(BadRequestException);
      });

      it('should throw BadRequestException for null without defaultValue', () => {
        expect(() => normalizeQuestionDifficulty(null)).toThrow(BadRequestException);
      });

      it('should return defaultValue for undefined when provided', () => {
        expect(normalizeQuestionDifficulty(undefined, { defaultValue: 'medium' })).toBe('medium');
      });

      it('should return defaultValue for null when provided', () => {
        expect(normalizeQuestionDifficulty(null, { defaultValue: 'hard' })).toBe('hard');
      });
    });

    describe('empty string handling', () => {
      it('should throw BadRequestException for empty string without defaultValue', () => {
        expect(() => normalizeQuestionDifficulty('')).toThrow(BadRequestException);
      });

      it('should throw BadRequestException for whitespace-only string without defaultValue', () => {
        expect(() => normalizeQuestionDifficulty('   ')).toThrow(BadRequestException);
      });

      it('should return defaultValue for empty string when provided', () => {
        expect(normalizeQuestionDifficulty('', { defaultValue: 'easy' })).toBe('easy');
      });
    });

    describe('unknown values', () => {
      it('should throw BadRequestException for unknown values', () => {
        expect(() => normalizeQuestionDifficulty('extreme')).toThrow(BadRequestException);
      });

      it('should throw BadRequestException for unknown values with custom fieldName', () => {
        expect(() => normalizeQuestionDifficulty('extreme', { fieldName: 'difficultyFilter' })).toThrow(
          /difficultyFilter/
        );
      });

      it('should include allowed values in error message', () => {
        try {
          normalizeQuestionDifficulty('unknown');
          fail('Expected BadRequestException');
        } catch (e) {
          expect(e.message).toContain('easy');
          expect(e.message).toContain('medium');
          expect(e.message).toContain('hard');
        }
      });
    });

    describe('non-string input', () => {
      it('should throw for numeric input that is not a valid difficulty string', () => {
        expect(() => normalizeQuestionDifficulty(123 as any)).toThrow(BadRequestException);
      });

      it('should handle object input gracefully', () => {
        expect(() => normalizeQuestionDifficulty({} as any)).toThrow(BadRequestException);
      });
    });

    describe('custom field name in error message', () => {
      it('should use custom fieldName in error message', () => {
        try {
          normalizeQuestionDifficulty('invalid', { fieldName: 'difficultyFilter' });
          fail('Expected BadRequestException');
        } catch (e) {
          expect(e.message).toContain('difficultyFilter');
        }
      });
    });
  });

  describe('normalizeQuestionDifficultyList', () => {
    it('should return undefined for null input', () => {
      expect(normalizeQuestionDifficultyList(null)).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      expect(normalizeQuestionDifficultyList(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(normalizeQuestionDifficultyList('')).toBeUndefined();
    });

    it('should normalize a single value', () => {
      const result = normalizeQuestionDifficultyList('easy');
      expect(result).toEqual(['easy']);
    });

    it('should normalize comma-separated values', () => {
      const result = normalizeQuestionDifficultyList('easy,medium,hard');
      expect(result).toEqual(['easy', 'medium', 'hard']);
    });

    it('should normalize aliases in list', () => {
      const result = normalizeQuestionDifficultyList('beginner,intermediate,advanced');
      expect(result).toEqual(['easy', 'medium', 'hard']);
    });

    it('should deduplicate values', () => {
      const result = normalizeQuestionDifficultyList('easy,easy,medium');
      expect(result).toEqual(['easy', 'medium']);
    });

    it('should handle whitespace in list', () => {
      const result = normalizeQuestionDifficultyList(' easy , medium , hard ');
      expect(result).toEqual(['easy', 'medium', 'hard']);
    });

    it('should throw for unknown values in list', () => {
      expect(() => normalizeQuestionDifficultyList('easy,unknown,hard')).toThrow(BadRequestException);
    });

    it('should use difficultyFilter as fieldName in errors', () => {
      try {
        normalizeQuestionDifficultyList('easy,unknown');
        fail('Expected BadRequestException');
      } catch (e) {
        expect(e.message).toContain('difficulty filter');
      }
    });
  });

  describe('normalizeOptionalQuestionDifficulty', () => {
    it('should return undefined for undefined input', () => {
      expect(normalizeOptionalQuestionDifficulty(undefined)).toBeUndefined();
    });

    it('should return undefined for null input', () => {
      expect(normalizeOptionalQuestionDifficulty(null)).toBeUndefined();
    });

    it('should normalize and return canonical value for valid input', () => {
      expect(normalizeOptionalQuestionDifficulty('beginner')).toBe('easy');
    });

    it('should throw for unknown values with default fieldName', () => {
      try {
        normalizeOptionalQuestionDifficulty('unknown');
        fail('Expected BadRequestException');
      } catch (e) {
        expect(e.message).toContain('difficulty');
      }
    });

    it('should throw with custom fieldName in error message', () => {
      try {
        normalizeOptionalQuestionDifficulty('unknown', 'customField');
        fail('Expected BadRequestException');
      } catch (e) {
        expect(e.message).toContain('customField');
      }
    });
  });

  describe('isCanonicalQuestionDifficulty', () => {
    it('should return true for canonical values', () => {
      expect(isCanonicalQuestionDifficulty('easy')).toBe(true);
      expect(isCanonicalQuestionDifficulty('medium')).toBe(true);
      expect(isCanonicalQuestionDifficulty('hard')).toBe(true);
    });

    it('should return false for aliases', () => {
      expect(isCanonicalQuestionDifficulty('beginner')).toBe(false);
      expect(isCanonicalQuestionDifficulty('intermediate')).toBe(false);
      expect(isCanonicalQuestionDifficulty('advanced')).toBe(false);
    });

    it('should return false for unknown values', () => {
      expect(isCanonicalQuestionDifficulty('unknown')).toBe(false);
      expect(isCanonicalQuestionDifficulty('extreme')).toBe(false);
    });

    it('should return false for null/undefined/empty', () => {
      expect(isCanonicalQuestionDifficulty(null)).toBe(false);
      expect(isCanonicalQuestionDifficulty(undefined)).toBe(false);
      expect(isCanonicalQuestionDifficulty('')).toBe(false);
    });
  });

  describe('CANONICAL_QUESTION_DIFFICULTIES constant', () => {
    it('should contain exactly 3 values', () => {
      expect(CANONICAL_QUESTION_DIFFICULTIES).toHaveLength(3);
    });

    it('should contain easy, medium, hard', () => {
      expect(CANONICAL_QUESTION_DIFFICULTIES).toContain('easy');
      expect(CANONICAL_QUESTION_DIFFICULTIES).toContain('medium');
      expect(CANONICAL_QUESTION_DIFFICULTIES).toContain('hard');
    });
  });

  describe('QUESTION_DIFFICULTY_ALIAS_MAP completeness', () => {
    const canonicalValues = ['easy', 'medium', 'hard'];

    it('should map all aliases to canonical values', () => {
      Object.values(QUESTION_DIFFICULTY_ALIAS_MAP).forEach((canonical) => {
        expect(canonicalValues).toContain(canonical);
      });
    });

    it('should have canonical values map to themselves', () => {
      canonicalValues.forEach((val) => {
        expect(QUESTION_DIFFICULTY_ALIAS_MAP[val]).toBe(val);
      });
    });
  });
});