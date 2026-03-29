"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("prisma/config");
const envCandidates = [
    node_path_1.default.resolve(process.cwd(), ".env"),
    node_path_1.default.resolve(process.cwd(), "..", ".env"),
    node_path_1.default.resolve(process.cwd(), ".env.local"),
];
for (const envPath of envCandidates) {
    if (node_fs_1.default.existsSync(envPath)) {
        dotenv_1.default.config({ path: envPath, override: true });
    }
}
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
});
//# sourceMappingURL=prisma.config.js.map