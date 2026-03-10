"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLog = exports.getAllLogs = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllLogs = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
exports.getAllLogs = getAllLogs;
const createLog = async (tenantId, action, details, userId) => {
    try {
        await prisma.log.create({
            data: {
                action,
                details,
                userId,
                tenantId
            }
        });
    }
    catch (error) {
        console.error('Failed to create log:', error);
    }
};
exports.createLog = createLog;
