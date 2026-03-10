import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async (req: any, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: any, res: Response) => {
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
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const updateProduct = async (req: any, res: Response) => {
  try {
    const { id, tenantId, createdAt, updatedAt, category, ...updateData } = req.body;
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.cost !== undefined) updateData.cost = Number(updateData.cost);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.minStock !== undefined) updateData.minStock = Number(updateData.minStock);

    const product = await prisma.product.update({
      where: { id: req.params.id, tenantId: req.tenantId },
      data: updateData
    });
    res.json(product);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const deleteProduct = async (req: any, res: Response) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id, tenantId: req.tenantId }
    });
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
