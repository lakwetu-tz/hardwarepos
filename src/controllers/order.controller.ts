import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createLog } from './log.controller';

const prisma = new PrismaClient();

export const createOrder = async (req: any, res: Response) => {
  const { items, customerId, total, tax, discount, paymentMethod } = req.body;
  const tenantId = req.user?.tenantId || req.tenantId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const orderNumber = `ORD-${Date.now()}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          total: Number(total),
          tax: Number(tax),
          discount: Number(discount || 0),
          status: 'COMPLETED',
          paymentMethod: paymentMethod || 'CASH',
          tenantId,
          customerId,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
              price: Number(item.price),
              total: Number(item.price) * Number(item.quantity)
            }))
          }
        },
        include: {
          items: { include: { product: true } },
          customer: true
        }
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: Number(item.quantity) } }
        });
      }

      if (customerId && paymentMethod === 'CREDIT') {
        const customer = await tx.customer.findUnique({ where: { id: customerId } });
        if (!customer) throw new Error('Customer not found');

        const newBalance = Number(customer.balance) + Number(total);
        if (newBalance > Number(customer.creditLimit)) throw new Error('Credit limit exceeded');

        await tx.customer.update({
          where: { id: customerId },
          data: { balance: newBalance }
        });
      }

      await createLog(tenantId, 'CREATE_ORDER', `Order created: ${orderNumber} for ${order.customer?.name || 'Retail'}`, req.user?.id);

      return order;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrders = async (req: any, res: Response) => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: {
        customer: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};
