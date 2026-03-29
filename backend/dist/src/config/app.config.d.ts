declare const _default: (() => {
    port: string | number;
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    sepay: {
        bankAccount: string;
        bankId: string;
        webhookSecret: string;
        paymentTimeoutMinutes: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: string | number;
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    sepay: {
        bankAccount: string;
        bankId: string;
        webhookSecret: string;
        paymentTimeoutMinutes: number;
    };
}>;
export default _default;
