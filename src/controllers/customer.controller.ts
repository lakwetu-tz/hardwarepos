import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createLog } from './log.controller';

const prisma = new PrismaClient();

export const getAllCustomers = async (req: any, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const createCustomer = async (req: any, res: Response) => {
  try {
    const { creditLimit, balance, ...data } = req.body;
    // Prefer tenantId from the authenticated user object
    const tenantId = req.user?.tenantId || req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant context missing' });
    }

    const customer = await prisma.customer.create({
      data: {
        ...data,
        creditLimit: Number(creditLimit || 0),
        balance: Number(balance || 0),
        tenantId: tenantId
      }
    });

    await createLog(tenantId, 'CREATE_CUSTOMER', `Created customer: ${customer.name}`, req.user?.id);

    res.status(201).json(customer);
  } catch (e: any) {
    console.error('Customer Creation Error:', e);
    // If it's a Prisma error, provide a clearer message
    if (e.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid Tenant ID. The associated tenant does not exist.' });
    }
    res.status(400).json({ error: e.message });
  }
};

export const updateCustomer = async (req: any, res: Response) => {
  try {
    const { id, tenantId: bodyTenantId, createdAt, updatedAt, ...updateData } = req.body;
    const tenantId = req.user?.tenantId || req.tenantId;

    if (updateData.creditLimit !== undefined) updateData.creditLimit = Number(updateData.creditLimit);
    if (updateData.balance !== undefined) updateData.balance = Number(updateData.balance);

    const customer = await prisma.customer.update({
      where: {
        id: req.params.id,
        tenantId: tenantId
      },
      data: updateData
    });

    await createLog(tenantId, 'UPDATE_CUSTOMER', `Updated customer: ${customer.name}`, req.user?.id);

    res.json(customer);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const deleteCustomer = async (req: any, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;

    const customer = await prisma.customer.findUnique({
      where: {
        id: req.params.id,
        tenantId: tenantId
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await prisma.customer.delete({
      where: {
        id: req.params.id,
        tenantId: tenantId
      }
    });

    await createLog(tenantId, 'DELETE_CUSTOMER', `Deleted customer: ${customer.name}`, req.user?.id);

    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
