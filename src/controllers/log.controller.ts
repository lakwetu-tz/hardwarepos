import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllLogs = async (req: any, res: Response) => {
  try {
    const logs = await prisma.log.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: { name: true }
        }
      },
      take: 100 // Limit to last 100 logs
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

export const createLog = async (tenantId: string, action: string, details?: string, userId?: string) => {
  try {
    await prisma.log.create({
      data: {
        action,
        details,
        userId,
        tenantId
      }
    });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
};
