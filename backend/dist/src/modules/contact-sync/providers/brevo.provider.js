"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrevoProvider = void 0;
class BrevoProvider {
    apiKey;
    listId;
    baseUrl = 'https://api.brevo.com/v3';
    constructor(config) {
        this.apiKey = config.apiKey;
        this.listId = config.listId;
    }
    async request(path, options = {}) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                'api-key': this.apiKey,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Brevo API error ${response.status}: ${body}`);
        }
        if (response.status === 204)
            return null;
        return response.json();
    }
    async upsertContact(contact) {
        try {
            await this.request('/contacts', {
                method: 'POST',
                body: JSON.stringify({
                    email: contact.email,
                    updateEnabled: true,
                    listIds: [this.listId],
                    attributes: {
                        FIRSTNAME: contact.firstName || '',
                        LASTNAME: contact.lastName || '',
                        ROLE: contact.role,
                        LMS_TAGS: contact.tags.join(','),
                    },
                }),
            });
            return { success: true, externalId: contact.email };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown Brevo error',
            };
        }
    }
    async deleteContact(email) {
        try {
            await this.request(`/contacts/${encodeURIComponent(email)}`, {
                method: 'DELETE',
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
    async addTags(email, tags) {
        try {
            const existing = await this.getContactTags(email);
            const merged = [...new Set([...existing, ...tags])];
            await this.request(`/contacts/${encodeURIComponent(email)}`, {
                method: 'PUT',
                body: JSON.stringify({
                    attributes: { LMS_TAGS: merged.join(',') },
                }),
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
            const existing = await this.getContactTags(email);
            const filtered = existing.filter((t) => !tags.includes(t));
            await this.request(`/contacts/${encodeURIComponent(email)}`, {
                method: 'PUT',
                body: JSON.stringify({
                    attributes: { LMS_TAGS: filtered.join(',') },
                }),
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
    async getContactTags(email) {
        try {
            const contact = await this.request(`/contacts/${encodeURIComponent(email)}`);
            const tagsStr = contact?.attributes?.LMS_TAGS || '';
            return tagsStr ? tagsStr.split(',').filter(Boolean) : [];
        }
        catch {
            return [];
        }
    }
    async batchUpsertContacts(contacts) {
        const result = {
            total: contacts.length,
            succeeded: 0,
            failed: 0,
            errors: [],
        };
        try {
            await this.request('/contacts/import', {
                method: 'POST',
                body: JSON.stringify({
                    listIds: [this.listId],
                    jsonBody: contacts.map((c) => ({
                        email: c.email,
                        attributes: {
                            FIRSTNAME: c.firstName || '',
                            LASTNAME: c.lastName || '',
                            ROLE: c.role,
                            LMS_TAGS: c.tags.join(','),
                        },
                    })),
                    updateExistingContacts: true,
                }),
            });
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
            await this.request('/account');
            await this.request(`/contacts/lists/${this.listId}`);
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
exports.BrevoProvider = BrevoProvider;
//# sourceMappingURL=brevo.provider.js.map