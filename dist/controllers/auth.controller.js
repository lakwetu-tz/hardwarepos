"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: { email },
            include: { tenant: true }
        });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            role: user.role,
            tenantId: user.tenantId
        }, SECRET_KEY);
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                tenantName: user.tenant.name
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
