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
    if (dto.type === 'drag_drop_text') {
        if (!dto.content.match(/\[slot_\d+\]/)) {
            throw new common_1.BadRequestException('drag_drop_text content must include at least one [slot_N] marker');
        }
        const correctTokens = dto.options?.filter(o => o.isCorrect && o.matchKey);
        if (!correctTokens?.length) {
            throw new common_1.BadRequestException('drag_drop_text must have at least one correct token with matchKey');
        }
    }
    if (dto.type === 'drag_drop_image') {
        if (!dto.mediaUrl) {
            throw new common_1.BadRequestException('drag_drop_image requires a mediaUrl');
        }
        const zones = dto.options?.filter(o => o.isCorrect && o.matchKey && o.matchValue);
        if (!zones?.length) {
            throw new common_1.BadRequestException('drag_drop_image must have at least one zone with matchKey + matchValue');
        }
        for (const zone of zones) {
            try {
                const c = JSON.parse(zone.matchValue);
                if (c.x === undefined || c.y === undefined)
                    throw new Error();
            }
            catch {
                throw new common_1.BadRequestException('Zone matchValue must be JSON { x, y, w, h }');
            }
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