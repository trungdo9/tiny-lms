"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendProvider = void 0;
const resend_1 = require("resend");
class ResendProvider {
    config;
    resend;
    constructor(config) {
        this.config = config;
        this.resend = new resend_1.Resend(config.apiKey);
    }
    async send(options) {
        try {
            const from = options.from || `${this.config.fromName} <${this.config.fromEmail}>`;
            const to = Array.isArray(options.to) ? options.to : [options.to];
            const data = await this.resend.emails.send({
                from,
                to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            if (data.error) {
                return { success: false, error: data.error.message };
            }
            return { success: true, messageId: data.data?.id };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.ResendProvider = ResendProvider;
//# sourceMappingURL=resend.provider.js.map