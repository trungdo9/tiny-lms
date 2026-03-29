import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

export interface ImportQuestion {
  type: string;
  content: string;
  options: { content: string; isCorrect: boolean }[];
  explanation?: string;
  difficulty?: string;
  defaultScore?: number;
  tags?: string[];
}

export interface ImportResult {
  questions: ImportQuestion[];
  errors: { row: number; error: string }[];
}

@Injectable()
export class ImportService {
  parseCSV(content: string): ImportResult {
    try {
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const questions: ImportQuestion[] = [];
      const errors: { row: number; error: string }[] = [];

      records.forEach((record: any, index: number) => {
        try {
          const question = this.parseRow(record, index + 2);
          if (question) {
            questions.push(question);
          }
        } catch (err: any) {
          errors.push({ row: index + 2, error: err.message });
        }
      });

      return { questions, errors };
    } catch (err: any) {
      throw new BadRequestException(`CSV parse error: ${err.message}`);
    }
  }

  parseExcel(buffer: Buffer): ImportResult {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const questions: ImportQuestion[] = [];
      const errors: { row: number; error: string }[] = [];

      records.forEach((record: any, index: number) => {
        try {
          const question = this.parseRow(record, index + 2);
          if (question) {
            questions.push(question);
          }
        } catch (err: any) {
          errors.push({ row: index + 2, error: err.message });
        }
      });

      return { questions, errors };
    } catch (err: any) {
      throw new BadRequestException(`Excel parse error: ${err.message}`);
    }
  }

  private parseRow(record: any, rowNumber: number): ImportQuestion | null {
    const type = record.type?.toLowerCase().trim();
    const content = record.content?.trim();

    if (!type || !content) {
      throw new Error('Missing required fields: type, content');
    }

    const validTypes = ['single', 'multi', 'true_false', 'short_answer', 'matching', 'ordering', 'cloze'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid question type: ${type}. Valid types: ${validTypes.join(', ')}`);
    }

    const options: { content: string; isCorrect: boolean; matchKey?: string; matchValue?: string; orderIndex?: number }[] = [];

    if (type === 'single' || type === 'true_false') {
      const correct = record.correct?.toString().toUpperCase().trim();

      if (type === 'true_false') {
        options.push({ content: 'True', isCorrect: correct === 'TRUE' || correct === 'A' || correct === 'T' });
        options.push({ content: 'False', isCorrect: correct === 'FALSE' || correct === 'B' || correct === 'F' });
      } else {
        if (record.option_a) options.push({ content: record.option_a, isCorrect: correct === 'A' });
        if (record.option_b) options.push({ content: record.option_b, isCorrect: correct === 'B' });
        if (record.option_c) options.push({ content: record.option_c, isCorrect: correct === 'C' });
        if (record.option_d) options.push({ content: record.option_d, isCorrect: correct === 'D' });
      }

      const hasCorrect = options.some(o => o.isCorrect);
      if (!hasCorrect) {
        throw new Error('No correct answer specified');
      }
    } else if (type === 'multi') {
      const correctAnswers = record.correct?.toString().split(',').map((s: string) => s.trim().toUpperCase()) || [];

      if (record.option_a) options.push({ content: record.option_a, isCorrect: correctAnswers.includes('A') });
      if (record.option_b) options.push({ content: record.option_b, isCorrect: correctAnswers.includes('B') });
      if (record.option_c) options.push({ content: record.option_c, isCorrect: correctAnswers.includes('C') });
      if (record.option_d) options.push({ content: record.option_d, isCorrect: correctAnswers.includes('D') });

      const hasCorrect = options.some(o => o.isCorrect);
      if (!hasCorrect) {
        throw new Error('No correct answer specified');
      }
    } else if (type === 'short_answer') {
      options.push({ content: record.correct?.trim() || '', isCorrect: true });
    } else if (type === 'matching') {
      // matching: option_a = key1, option_b = value1, option_c = key2, option_d = value2, etc.
      // correct format: "key1:value1,key2:value2"
      const correctPairs = record.correct?.toString().split(',').map((s: string) => s.trim()) || [];
      const allKeys = [record.option_a, record.option_b, record.option_c, record.option_d, record.option_e, record.option_f].filter(Boolean);
      const allValues = [record.match_a, record.match_b, record.match_c, record.match_d, record.match_e, record.match_f].filter(Boolean);

      // Create pairs from keys and values
      if (allKeys.length > 0 && allValues.length > 0) {
        // If correct pairs provided, use them
        if (correctPairs.length > 0) {
          correctPairs.forEach((pair: string) => {
            const [key, value] = pair.split(':').map((s: string) => s.trim());
            if (key && value) {
              options.push({ content: key, isCorrect: true, matchKey: key, matchValue: value });
            }
          });
        } else {
          // Default: match keys to values in order
          const maxLen = Math.max(allKeys.length, allValues.length);
          for (let i = 0; i < maxLen; i++) {
            const key = allKeys[i] || '';
            const value = allValues[i] || '';
            if (key && value) {
              options.push({ content: key, isCorrect: true, matchKey: key, matchValue: value });
            }
          }
        }
      }
      if (options.length === 0) {
        throw new Error('Matching requires key-value pairs in option_a-f and match_a-f columns');
      }
    } else if (type === 'ordering') {
      // ordering: option_a, option_b, option_c = items to order
      // correct format: "1,2,3" or "A,B,C" (the order)
      const orderStr = record.correct?.toString() || '1';
      const orderParts = orderStr.split(',').map((s: string) => s.trim());

      const allOptions = [record.option_a, record.option_b, record.option_c, record.option_d, record.option_e, record.option_f].filter(Boolean);

      if (allOptions.length === 0) {
        throw new Error('Ordering requires items in option_a-f columns');
      }

      // Create options with orderIndex
      allOptions.forEach((opt: string, idx: number) => {
        const orderIdx = orderParts[idx] ? parseInt(orderParts[idx]) - 1 : idx;
        options.push({ content: opt, isCorrect: true, orderIndex: orderIdx });
      });
    } else if (type === 'cloze') {
      // cloze: content has {blank}, correct has "answer1,answer2,answer3"
      // Parse content to extract blanks
      const correctAnswers = record.correct?.toString().split(',').map((s: string) => s.trim()) || [];
      const blankMatches = content.match(/\{(\d+)?\}/g) || [];

      if (blankMatches.length === 0) {
        throw new Error('Cloze requires {blank} placeholders in content');
      }

      // Create options for each blank
      blankMatches.forEach((blank: string, idx: number) => {
        const answer = correctAnswers[idx] || '';
        if (!answer) {
          throw new Error(`Missing answer for blank ${idx + 1}`);
        }
        options.push({ content: answer, isCorrect: true });
      });
    }

    let tags: string[] = [];
    if (record.tags) {
      tags = record.tags.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    return {
      type,
      content,
      options,
      explanation: record.explanation?.trim() || undefined,
      difficulty: record.difficulty?.toLowerCase().trim() || 'normal',
      defaultScore: parseInt(record.score) || 1,
      tags,
    };
  }

  generateTemplate(): string {
    const headers = ['type', 'content', 'option_a', 'option_b', 'option_c', 'option_d', 'match_a', 'match_b', 'match_c', 'match_d', 'correct', 'score', 'difficulty', 'explanation', 'tags'];
    const examples = [
      'single,"What is the capital of France?","Paris","London","Berlin","Madrid","","","","","A",1,easy,"Paris is the capital","geography,cities"',
      'multi,"Which are programming languages?","Python","HTML","CSS","Java","","","","","A,D",1,normal,"","programming"',
      'true_false,"The sun is a star.","True","False","","","","","","","A",1,easy,"","astronomy"',
      'short_answer,"What is 2+2?","","","","","","","","","4",1,easy,"","math"',
      'matching,"Match countries to capitals","France","Japan","Germany","","Paris","Tokyo","Berlin","","France:Paris,Japan:Tokyo,Germany:Berlin",1,medium,"","geography"',
      'ordering,"Arrange in order by size (small to large)","Atom","Cell","Planet","","","","","","1,2,3",1,easy,"","science"',
      'cloze,"The {1} is the largest planet in our solar system.","Jupiter","","","","","","","","1",1,easy,"","astronomy"',
    ];
    return [headers.join(','), ...examples].join('\n');
  }
}
