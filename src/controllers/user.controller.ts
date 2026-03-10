import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.tenantId },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: any, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
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
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    await prisma.user.delete({
      where: { id: req.params.id, tenantId: req.tenantId }
    });
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
