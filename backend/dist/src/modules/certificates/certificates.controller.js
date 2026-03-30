"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../common/guards/supabase-auth.guard");
const certificates_service_1 = require("./certificates.service");
let CertificatesController = class CertificatesController {
    certificatesService;
    constructor(certificatesService) {
        this.certificatesService = certificatesService;
    }
    async issueCertificate(req, courseId) {
        return this.certificatesService.issueCertificate(req.user.id, courseId);
    }
    async getMyCertificates(req) {
        return this.certificatesService.getMyCertificates(req.user.id);
    }
    async checkEligibility(req, courseId) {
        return this.certificatesService.isEligibleForCertificate(req.user.id, courseId);
    }
    async verifyCertificate(certificateNumber) {
        return this.certificatesService.findByNumber(certificateNumber);
    }
    async getCertificate(id) {
        return this.certificatesService.getCertificateById(id);
    }
    async getCertificatePdf(id, res) {
        const pdfBuffer = await this.certificatesService.generatePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="certificate-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.status(common_1.HttpStatus.OK).send(pdfBuffer);
    }
};
exports.CertificatesController = CertificatesController;
__decorate([
    (0, common_1.Post)('issue/:courseId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "issueCertificate", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "getMyCertificates", null);
__decorate([
    (0, common_1.Get)('eligible/:courseId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "checkEligibility", null);
__decorate([
    (0, common_1.Get)('verify/:certificateNumber'),
    __param(0, (0, common_1.Param)('certificateNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "verifyCertificate", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "getCertificate", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "getCertificatePdf", null);
exports.CertificatesController = CertificatesController = __decorate([
    (0, swagger_1.ApiTags)('certificates'),
    (0, common_1.Controller)('certificates'),
    __metadata("design:paramtypes", [certificates_service_1.CertificatesService])
], CertificatesController);
//# sourceMappingURL=certificates.controller.js.map