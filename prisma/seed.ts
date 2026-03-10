import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting hardware-focused seed...')

  // Clean up existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  // 1. Create Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'BuildFlow Industrial Supplies',
      subdomain: 'main',
    },
  })

  // 2. Create Users (Simplified roles: ADMIN and USER)
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  await prisma.user.create({
    data: {
      email: 'admin@buildflow.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id
    }
  })

  await prisma.user.create({
    data: {
      email: 'user@buildflow.com',
      password: hashedPassword,
      name: 'POS User',
      role: 'USER',
      tenantId: tenant.id
    }
  })

  // 3. Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Power Tools', tenantId: tenant.id } }),
    prisma.category.create({ data: { name: 'Building Materials', tenantId: tenant.id } }),
    prisma.category.create({ data: { name: 'Plumbing', tenantId: tenant.id } }),
    prisma.category.create({ data: { name: 'Electrical', tenantId: tenant.id } }),
    prisma.category.create({ data: { name: 'Safety Gear', tenantId: tenant.id } }),
  ])

  // 4. Create Hardware Products
  const hardwareProducts = [
    {
      name: 'DeWalt DCD771C2 20V Max Drill',
      sku: 'DW-DRILL-20V',
      barcode: '885911319522',
      price: 159.00,
      cost: 110.00,
      stock: 25,
      unit: 'unit',
      categoryId: categories[0].id,
      description: 'High performance motor delivers 300 unit watts out (UWO).',
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Makita 18V LXT Impact Driver',
      sku: 'MAK-IMP-18',
      barcode: '088381659987',
      price: 129.00,
      cost: 85.00,
      stock: 15,
      unit: 'unit',
      categoryId: categories[0].id,
      description: 'Variable speed (0-2,900 RPM & 0-3,500 IPM).',
      imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Portland Cement 50kg Bag',
      sku: 'CEM-PORT-50',
      barcode: '600123456789',
      price: 12.50,
      cost: 7.00,
      stock: 500,
      unit: 'bag',
      categoryId: categories[1].id,
      description: 'General purpose cement for all types of construction.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Standard Red Clay Brick',
      sku: 'BRICK-RED-STD',
      barcode: '600987654321',
      price: 0.85,
      cost: 0.40,
      stock: 5000,
      unit: 'unit',
      categoryId: categories[1].id,
      description: 'Classic building brick for wall construction.',
      imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec4?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'PVC Pipe 110mm x 6m',
      sku: 'PVC-110-6M',
      barcode: '600555444333',
      price: 45.00,
      cost: 28.00,
      stock: 120,
      unit: 'm',
      categoryId: categories[2].id,
      description: 'Heavy duty waste water pipe.',
      imageUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=300&q=80'
    }
  ]

  for (const p of hardwareProducts) {
    await prisma.product.create({
      data: { ...p, tenantId: tenant.id, minStock: 10 }
    })
  }

  // 5. Create Customers
  await prisma.customer.create({
    data: {
      name: 'BuildIt Construction Ltd',
      email: 'accounts@buildit.com',
      phone: '+254711223344',
      isContractor: true,
      creditLimit: 50000,
      balance: 1500,
      tenantId: tenant.id
    }
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
