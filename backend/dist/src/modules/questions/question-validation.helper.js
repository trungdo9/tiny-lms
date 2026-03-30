"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuestionDto = validateQuestionDto;
exports.checkBankOwnership = checkBankOwnership;
const common_1 = require("@nestjs/common");
const question_dto_1 = require("./dto/question.dto");
const TYPES_REQUIRING_OPTIONS = question_dto_1.VALID_QUESTION_TYPES.filter(t => ['single', 'multi', 'true_false'].includes(t));
const TYPES_REQUIRING_ONE_CORRECT = question_dto_1.VALID_QUESTION_TYPES.filter(t => ['single', 'true_false'].includes(t));
function validateQuestionDto(dto) {
    if (TYPES_REQUIRING_OPTIONS.includes(dto.type) && (!dto.options || dto.options.length === 0)) {
        throw new common_1.BadRequestException('Question options are required for this type');
    }
    if (TYPES_REQUIRING_ONE_CORRECT.includes(dto.type) && dto.options) {
        const correctCount = dto.options.filter(o => o.isCorrect).length;
        if (correctCount !== 1) {
            throw new common_1.BadRequestException('Single/True-False questions must have exactly one correct answer');
        }
    }
}
async function checkBankOwnership(prisma, bankId, userId, userRole) {
    const bank = await prisma.questionBank.findUnique({ where: { id: bankId } });
    if (!bank)
        throw new common_1.NotFoundException('Question bank not found');
    if (userRole !== 'admin' && bank.createdBy !== userId) {
        throw new common_1.ForbiddenException('You do not have access to this question bank');
    }
    return bank;
}
//# sourceMappingURL=question-validation.helper.js.map