"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getAllCustomers = void 0;
const client_1 = require("@prisma/client");
const log_controller_1 = require("./log.controller");
const prisma = new client_1.PrismaClient();
const getAllCustomers = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || req.tenantId;
        const customers = await prisma.customer.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};
exports.getAllCustomers = getAllCustomers;
const createCustomer = async (req, res) => {
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
        await (0, log_controller_1.createLog)(tenantId, 'CREATE_CUSTOMER', `Created customer: ${customer.name}`, req.user?.id);
        res.status(201).json(customer);
    }
    catch (e) {
        console.error('Customer Creation Error:', e);
        // If it's a Prisma error, provide a clearer message
        if (e.code === 'P2003') {
            return res.status(400).json({ error: 'Invalid Tenant ID. The associated tenant does not exist.' });
        }
        res.status(400).json({ error: e.message });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id, tenantId: bodyTenantId, createdAt, updatedAt, ...updateData } = req.body;
        const tenantId = req.user?.tenantId || req.tenantId;
        if (updateData.creditLimit !== undefined)
            updateData.creditLimit = Number(updateData.creditLimit);
        if (updateData.balance !== undefined)
            updateData.balance = Number(updateData.balance);
        const customer = await prisma.customer.update({
            where: {
                id: req.params.id,
                tenantId: tenantId
            },
            data: updateData
        });
        await (0, log_controller_1.createLog)(tenantId, 'UPDATE_CUSTOMER', `Updated customer: ${customer.name}`, req.user?.id);
        res.json(customer);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
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
        await (0, log_controller_1.createLog)(tenantId, 'DELETE_CUSTOMER', `Deleted customer: ${customer.name}`, req.user?.id);
        res.status(204).send();
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
};
exports.deleteCustomer = deleteCustomer;
