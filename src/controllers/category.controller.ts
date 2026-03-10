import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCategories = async (req: any, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: any, res: Response) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        tenantId: req.tenantId
      }
    });
    res.status(201).json(category);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
