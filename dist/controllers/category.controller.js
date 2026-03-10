"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.getAllCategories = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { tenantId: req.tenantId },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
exports.getAllCategories = getAllCategories;
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.create({
            data: {
                name,
                tenantId: req.tenantId
            }
        });
        res.status(201).json(category);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
};
exports.createCategory = createCategory;
