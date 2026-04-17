import { ImportService } from './import.service';

describe('ImportService', () => {
  let service: ImportService;

  beforeEach(() => {
    service = new ImportService();
  });

  describe('parseCSV — difficulty normalization', () => {
    function csvRow(difficulty: string) {
      return [
        'type,content,option_a,option_b,option_c,option_d,correct,score,difficulty',
        `single,"Test question","A","B","C","D","A",1,${difficulty}`,
      ].join('\n');
    }

    it('accepts canonical easy', () => {
      const result = service.parseCSV(csvRow('easy'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('easy');
    });

    it('accepts canonical medium', () => {
      const result = service.parseCSV(csvRow('medium'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('medium');
    });

    it('accepts canonical hard', () => {
      const result = service.parseCSV(csvRow('hard'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('hard');
    });

    it('maps alias beginner → easy', () => {
      const result = service.parseCSV(csvRow('beginner'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('easy');
    });

    it('maps alias basic → easy', () => {
      const result = service.parseCSV(csvRow('basic'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('easy');
    });

    it('maps alias intermediate → medium', () => {
      const result = service.parseCSV(csvRow('intermediate'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('medium');
    });

    it('maps alias normal → medium', () => {
      const result = service.parseCSV(csvRow('normal'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('medium');
    });

    it('maps alias advanced → hard', () => {
      const result = service.parseCSV(csvRow('advanced'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('hard');
    });

    it('maps alias difficult → hard', () => {
      const result = service.parseCSV(csvRow('difficult'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('hard');
    });

    it('normalizes uppercase aliases — EASY → easy', () => {
      const result = service.parseCSV(csvRow('EASY'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('easy');
    });

    it('normalizes uppercase aliases — ADVANCED → hard', () => {
      const result = service.parseCSV(csvRow('ADVANCED'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('hard');
    });

    it('produces row-level error for unknown difficulty label', () => {
      const result = service.parseCSV(csvRow('extreme'));
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[0].error).toMatch(/extreme/i);
      expect(result.questions).toHaveLength(0);
    });

    it('produces row-level error for another unknown label without aborting other rows', () => {
      const csv = [
        'type,content,option_a,option_b,option_c,option_d,correct,score,difficulty',
        'single,"Good question","A","B","C","D","A",1,easy',
        'single,"Bad question","A","B","C","D","A",1,super_hard',
        'single,"Another good","A","B","C","D","A",1,medium',
      ].join('\n');

      const result = service.parseCSV(csv);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(3);
      expect(result.questions).toHaveLength(2);
      expect(result.questions[0].difficulty).toBe('easy');
      expect(result.questions[1].difficulty).toBe('medium');
    });

    it('defaults empty difficulty to medium', () => {
      const csv = [
        'type,content,option_a,option_b,option_c,option_d,correct,score,difficulty',
        'single,"Test question","A","B","C","D","A",1,',
      ].join('\n');

      const result = service.parseCSV(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('medium');
    });
  });

  describe('parseExcel — difficulty normalization', () => {
    const XLSX = require('xlsx');

    function makeExcelBuffer(difficulty: string): Buffer {
      const ws = XLSX.utils.aoa_to_sheet([
        ['type', 'content', 'option_a', 'option_b', 'option_c', 'option_d', 'correct', 'score', 'difficulty'],
        ['single', 'Test question', 'A', 'B', 'C', 'D', 'A', 1, difficulty],
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }

    it('maps alias beginner → easy in Excel', () => {
      const result = service.parseExcel(makeExcelBuffer('beginner'));
      expect(result.errors).toHaveLength(0);
      expect(result.questions[0].difficulty).toBe('easy');
    });

    it('produces row-level error for unknown difficulty in Excel', () => {
      const result = service.parseExcel(makeExcelBuffer('extreme'));
      expect(result.errors).toHaveLength(1);
      expect(result.questions).toHaveLength(0);
    });
  });

  describe('generateTemplate', () => {
    it('includes difficulty column', () => {
      const template = service.generateTemplate();
      expect(template).toContain('difficulty');
    });

    it('uses only canonical difficulty values in examples', () => {
      const template = service.generateTemplate();
      // Extract all standalone difficulty words from the template (not inside quotes with commas)
      // Check that non-canonical aliases like beginner/advanced don't appear as difficulty values
      expect(template).not.toMatch(/,beginner,/);
      expect(template).not.toMatch(/,advanced,/);
      expect(template).not.toMatch(/,intermediate,/);
      // Template examples should contain at least one canonical value
      expect(template).toMatch(/,easy,|,medium,|,hard,/);
    });
  });
});
