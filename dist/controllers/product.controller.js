"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getAllProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllProducts = async (req, res) => {
    const { search, categoryId } = req.query;
    try {
        const products = await prisma.product.findMany({
            where: {
                tenantId: req.tenantId,
                ...(categoryId ? { categoryId: String(categoryId) } : {}),
                ...(search ? {
                    OR: [
                        { name: { contains: String(search), mode: 'insensitive' } },
                        { sku: { contains: String(search), mode: 'insensitive' } },
                        { barcode: { contains: String(search), mode: 'insensitive' } },
                    ]
                } : {})
            },
            include: { category: true },
            orderBy: { name: 'asc' }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getAllProducts = getAllProducts;
const createProduct = async (req, res) => {
    try {
        const { price, cost, stock, minStock, ...data } = req.body;
        const product = await prisma.product.create({
            data: {
                ...data,
                price: Number(price),
                cost: Number(cost),
                stock: Number(stock),
                minStock: Number(minStock || 0),
                tenantId: req.tenantId
            }
        });
        res.status(201).json(product);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id, tenantId, createdAt, updatedAt, category, ...updateData } = req.body;
        if (updateData.price !== undefined)
            updateData.price = Number(updateData.price);
        if (updateData.cost !== undefined)
            updateData.cost = Number(updateData.cost);
        if (updateData.stock !== undefined)
            updateData.stock = Number(updateData.stock);
        if (updateData.minStock !== undefined)
            updateData.minStock = Number(updateData.minStock);
        const product = await prisma.product.update({
            where: { id: req.params.id, tenantId: req.tenantId },
            data: updateData
        });
        res.json(product);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: req.params.id, tenantId: req.tenantId }
        });
        res.status(204).send();
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
};
exports.deleteProduct = deleteProduct;
