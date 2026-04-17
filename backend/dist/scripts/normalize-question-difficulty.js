"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
const database_url_1 = require("../src/common/database-url");
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionUrl = (0, database_url_1.getDatabaseUrl)();
const pool = new pg_1.Pool({
    connectionString: connectionUrl,
    ssl: { rejectUnauthorized: false },
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('=== Question Difficulty Normalization Backfill ===\n');
    const beforeDistinct = await prisma.$queryRaw `
    SELECT difficulty, COUNT(*)::int AS cnt FROM questions GROUP BY difficulty ORDER BY cnt DESC
  `;
    console.log('Before — questions.difficulty distribution:');
    beforeDistinct.forEach(r => console.log(`  ${JSON.stringify(r.difficulty)}: ${r.cnt}`));
    const beforeFilterDistinct = await prisma.$queryRaw `
    SELECT difficulty_filter, COUNT(*)::int AS cnt FROM quiz_questions GROUP BY difficulty_filter ORDER BY cnt DESC
  `;
    console.log('\nBefore — quiz_questions.difficulty_filter distribution:');
    beforeFilterDistinct.forEach(r => console.log(`  ${JSON.stringify(r.difficulty_filter)}: ${r.cnt}`));
    console.log('\n--- Running normalization ---\n');
    const easyQ = await prisma.$executeRaw `
    UPDATE questions SET difficulty = 'easy'
    WHERE LOWER(TRIM(difficulty)) IN ('easy', 'beginner', 'basic')
      AND difficulty != 'easy'
  `;
    console.log(`questions: mapped to 'easy': ${easyQ} rows`);
    const mediumQ = await prisma.$executeRaw `
    UPDATE questions SET difficulty = 'medium'
    WHERE LOWER(TRIM(difficulty)) IN ('medium', 'intermediate', 'normal', 'avg', 'average')
      AND difficulty != 'medium'
  `;
    console.log(`questions: mapped to 'medium': ${mediumQ} rows`);
    const hardQ = await prisma.$executeRaw `
    UPDATE questions SET difficulty = 'hard'
    WHERE LOWER(TRIM(difficulty)) IN ('hard', 'advanced', 'difficult')
      AND difficulty != 'hard'
  `;
    console.log(`questions: mapped to 'hard': ${hardQ} rows`);
    const fallbackQ = await prisma.$executeRaw `
    UPDATE questions SET difficulty = 'medium'
    WHERE difficulty IS NULL
       OR TRIM(difficulty) = ''
       OR LOWER(TRIM(difficulty)) NOT IN ('easy', 'medium', 'hard')
  `;
    console.log(`questions: fallback to 'medium' (unknown/null): ${fallbackQ} rows`);
    const easyF = await prisma.$executeRaw `
    UPDATE quiz_questions SET difficulty_filter = 'easy'
    WHERE LOWER(TRIM(difficulty_filter)) IN ('easy', 'beginner', 'basic')
      AND difficulty_filter != 'easy'
  `;
    console.log(`\nquiz_questions: mapped to 'easy': ${easyF} rows`);
    const mediumF = await prisma.$executeRaw `
    UPDATE quiz_questions SET difficulty_filter = 'medium'
    WHERE LOWER(TRIM(difficulty_filter)) IN ('medium', 'intermediate', 'normal', 'avg', 'average')
      AND difficulty_filter != 'medium'
  `;
    console.log(`quiz_questions: mapped to 'medium': ${mediumF} rows`);
    const hardF = await prisma.$executeRaw `
    UPDATE quiz_questions SET difficulty_filter = 'hard'
    WHERE LOWER(TRIM(difficulty_filter)) IN ('hard', 'advanced', 'difficult')
      AND difficulty_filter != 'hard'
  `;
    console.log(`quiz_questions: mapped to 'hard': ${hardF} rows`);
    const nullF = await prisma.$executeRaw `
    UPDATE quiz_questions SET difficulty_filter = NULL
    WHERE difficulty_filter IS NOT NULL
      AND LOWER(TRIM(difficulty_filter)) NOT IN ('easy', 'medium', 'hard', 'beginner', 'basic', 'intermediate', 'normal', 'avg', 'average', 'advanced', 'difficult')
  `;
    console.log(`quiz_questions: set to NULL (unknown): ${nullF} rows`);
    console.log('\n--- After normalization ---\n');
    const afterDistinct = await prisma.$queryRaw `
    SELECT difficulty, COUNT(*)::int AS cnt FROM questions GROUP BY difficulty ORDER BY cnt DESC
  `;
    console.log('After — questions.difficulty distribution:');
    afterDistinct.forEach(r => console.log(`  ${JSON.stringify(r.difficulty)}: ${r.cnt}`));
    const afterFilterDistinct = await prisma.$queryRaw `
    SELECT difficulty_filter, COUNT(*)::int AS cnt FROM quiz_questions GROUP BY difficulty_filter ORDER BY cnt DESC
  `;
    console.log('\nAfter — quiz_questions.difficulty_filter distribution:');
    afterFilterDistinct.forEach(r => console.log(`  ${JSON.stringify(r.difficulty_filter)}: ${r.cnt}`));
    console.log('\nDone.');
}
main()
    .catch((e) => {
    console.error((0, database_url_1.decorateDatabaseConnectionError)(e, connectionUrl));
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=normalize-question-difficulty.js.map