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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailchimpProvider = void 0;
const crypto = __importStar(require("crypto"));
const mailchimp_marketing_1 = __importDefault(require("@mailchimp/mailchimp_marketing"));
class MailchimpProvider {
    listId;
    constructor(config) {
        const [key, server] = config.apiKey.split('-');
        mailchimp_marketing_1.default.setConfig({ apiKey: key, server: server || 'us1' });
        this.listId = config.listId;
    }
    subscriberHash(email) {
        return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    }
    async upsertContact(contact) {
        try {
            const hash = this.subscriberHash(contact.email);
            const response = await mailchimp_marketing_1.default.lists.setListMember(this.listId, hash, {
                email_address: contact.email,
                status_if_new: 'subscribed',
                merge_fields: {
                    FNAME: contact.firstName || '',
                    LNAME: contact.lastName || '',
                    ROLE: contact.role,
                    ...(contact.customFields || {}),
                },
            });
            if (contact.tags.length > 0) {
                await mailchimp_marketing_1.default.lists.updateListMemberTags(this.listId, hash, {
                    tags: contact.tags.map((name) => ({ name, status: 'active' })),
                });
            }
            return { success: true, externalId: response.id };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown Mailchimp error',
            };
        }
    }
    async deleteContact(email) {
        try {
            const hash = this.subscriberHash(email);
            await mailchimp_marketing_1.default.lists.deleteListMember(this.listId, hash);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async addTags(email, tags) {
        try {
            const hash = this.subscriberHash(email);
            await mailchimp_marketing_1.default.lists.updateListMemberTags(this.listId, hash, {
                tags: tags.map((name) => ({ name, status: 'active' })),
            });
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async removeTags(email, tags) {
        try {
            const hash = this.subscriberHash(email);
            await mailchimp_marketing_1.default.lists.updateListMemberTags(this.listId, hash, {
                tags: tags.map((name) => ({ name, status: 'inactive' })),
            });
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async batchUpsertContacts(contacts) {
        const result = {
            total: contacts.length,
            succeeded: 0,
            failed: 0,
            errors: [],
        };
        const operations = contacts.map((contact) => ({
            method: 'PUT',
            path: `/lists/${this.listId}/members/${this.subscriberHash(contact.email)}`,
            body: JSON.stringify({
                email_address: contact.email,
                status_if_new: 'subscribed',
                merge_fields: {
                    FNAME: contact.firstName || '',
                    LNAME: contact.lastName || '',
                    ROLE: contact.role,
                },
            }),
        }));
        try {
            await mailchimp_marketing_1.default.batches.start({ operations });
            result.succeeded = contacts.length;
        }
        catch (error) {
            result.failed = contacts.length;
            result.errors = contacts.map((c) => ({
                email: c.email,
                error: error instanceof Error ? error.message : 'Batch failed',
            }));
        }
        return result;
    }
    async verifyConnection() {
        try {
            await mailchimp_marketing_1.default.ping.get();
            await mailchimp_marketing_1.default.lists.getList(this.listId);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Connection failed',
            };
        }
    }
}
exports.MailchimpProvider = MailchimpProvider;
//# sourceMappingURL=mailchimp.provider.js.map