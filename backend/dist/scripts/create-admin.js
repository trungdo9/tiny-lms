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
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
const database_url_1 = require("../src/common/database-url");
dotenv.config({ path: '.env' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const connectionUrl = (0, database_url_1.getDatabaseUrl)();
const pool = new pg_1.Pool({
    connectionString: connectionUrl,
    ssl: { rejectUnauthorized: false },
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
async function createAdminUser() {
    const timestamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const email = `admin.${timestamp}.${rand}@example.com`;
    const password = 'AdminPass123!';
    const fullName = `Admin User ${timestamp}`;
    console.log('Creating admin user...');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('');
    try {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
            },
        });
        if (authError) {
            if (authError.message.includes('already been registered')) {
                console.log('User already exists in Supabase Auth, checking database...');
                const existingUser = await prisma.profile.findUnique({ where: { email } });
                if (existingUser && existingUser.role === 'admin') {
                    console.log('\n✅ Admin user already exists:');
                    console.log(`   Email: ${email}`);
                    console.log(`   Password: ${password}`);
                    console.log(`   Role: ${existingUser.role}`);
                    return;
                }
            }
            else {
                throw authError;
            }
        }
        const userId = authUser?.user?.id;
        if (!userId) {
            throw new Error('No user ID returned from Supabase');
        }
        const profile = await prisma.profile.upsert({
            where: { id: userId },
            update: { role: 'admin', fullName },
            create: {
                id: userId,
                email,
                fullName,
                role: 'admin',
                isActive: true,
                emailVerified: true,
            },
        });
        console.log('\n✅ Admin user created successfully!');
        console.log('');
        console.log('=== ADMIN CREDENTIALS ===');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role:     ${profile.role}`);
        console.log('');
        console.log('Save these credentials!');
    }
    catch (error) {
        console.error('Error creating admin user:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
createAdminUser()
    .then(() => {
    console.log('\nDone!');
    process.exit(0);
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=create-admin.js.map