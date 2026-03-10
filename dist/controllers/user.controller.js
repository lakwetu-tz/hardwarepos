"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createUser = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { tenantId: req.tenantId },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
const createUser = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                tenantId: req.tenantId
            }
        });
        res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
};
exports.createUser = createUser;
const deleteUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }
        await prisma.user.delete({
            where: { id: req.params.id, tenantId: req.tenantId }
        });
        res.status(204).send();
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
};
exports.deleteUser = deleteUser;
