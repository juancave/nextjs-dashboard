import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt';

const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User',
    email: 'user@nextmail.com',
    password: '123456',
  },
];

const customers = [
  {
    id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    name: 'Delba de Oliveira',
    email: 'delba@oliveira.com',
    image_url: '/customers/delba-de-oliveira.png',
  },
  {
    id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    name: 'Lee Robinson',
    email: 'lee@robinson.com',
    image_url: '/customers/lee-robinson.png',
  },
  {
    id: '3958dc9e-737f-4377-85e9-fec4b6a6442a',
    name: 'Hector Simpson',
    email: 'hector@simpson.com',
    image_url: '/customers/hector-simpson.png',
  },
  {
    id: '50ca3e18-62cd-11ee-8c99-0242ac120002',
    name: 'Steven Tey',
    email: 'steven@tey.com',
    image_url: '/customers/steven-tey.png',
  },
  {
    id: '3958dc9e-787f-4377-85e9-fec4b6a6442a',
    name: 'Steph Dietz',
    email: 'steph@dietz.com',
    image_url: '/customers/steph-dietz.png',
  },
  {
    id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
    name: 'Michael Novotny',
    email: 'michael@novotny.com',
    image_url: '/customers/michael-novotny.png',
  },
  {
    id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
    name: 'Evil Rabbit',
    email: 'evil@rabbit.com',
    image_url: '/customers/evil-rabbit.png',
  },
  {
    id: '126eed9c-c90c-4ef6-a4a8-fcf7408d3c66',
    name: 'Emil Kowalski',
    email: 'emil@kowalski.com',
    image_url: '/customers/emil-kowalski.png',
  },
  {
    id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
    name: 'Amy Burns',
    email: 'amy@burns.com',
    image_url: '/customers/amy-burns.png',
  },
  {
    id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB',
    name: 'Balazs Orban',
    email: 'balazs@orban.com',
    image_url: '/customers/balazs-orban.png',
  },
];

const invoices = [
  {
    customer_id: customers[0].id,
    amount: 15795,
    status: 'pending',
    date: '2022-12-06',
    customer_email: customers[0].email,
  },
  {
    customer_id: customers[1].id,
    amount: 20348,
    status: 'pending',
    date: '2022-11-14',
    customer_email: customers[1].email,
  },
  {
    customer_id: customers[4].id,
    amount: 3040,
    status: 'paid',
    date: '2022-10-29',
    customer_email: customers[4].email,
  },
  {
    customer_id: customers[3].id,
    amount: 44800,
    status: 'paid',
    date: '2023-09-10',
    customer_email: customers[3].email,
  },
  {
    customer_id: customers[5].id,
    amount: 34577,
    status: 'pending',
    date: '2023-08-05',
    customer_email: customers[5].email,
  },
  {
    customer_id: customers[7].id,
    amount: 54246,
    status: 'pending',
    date: '2023-07-16',
    customer_email: customers[7].email,
  },
  {
    customer_id: customers[6].id,
    amount: 666,
    status: 'pending',
    date: '2023-06-27',
    customer_email: customers[6].email,
  },
  {
    customer_id: customers[3].id,
    amount: 32545,
    status: 'paid',
    date: '2023-06-09',
    customer_email: customers[3].email,
  },
  {
    customer_id: customers[4].id,
    amount: 1250,
    status: 'paid',
    date: '2023-06-17',
    customer_email: customers[4].email,
  },
  {
    customer_id: customers[5].id,
    amount: 8546,
    status: 'paid',
    date: '2023-06-07',
    customer_email: customers[5].email,
  },
  {
    customer_id: customers[1].id,
    amount: 500,
    status: 'paid',
    date: '2023-08-19',
    customer_email: customers[1].email,
  },
  {
    customer_id: customers[5].id,
    amount: 8945,
    status: 'paid',
    date: '2023-06-03',
    customer_email: customers[5].email,
  },
  {
    customer_id: customers[2].id,
    amount: 8945,
    status: 'paid',
    date: '2023-06-18',
    customer_email: customers[2].email,
  },
  {
    customer_id: customers[0].id,
    amount: 8945,
    status: 'paid',
    date: '2023-10-04',
    customer_email: customers[0].email,
  },
  {
    customer_id: customers[2].id,
    amount: 1000,
    status: 'paid',
    date: '2022-06-05',
    customer_email: customers[2].email,
  },
];

const revenue = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2200 },
  { month: 'Apr', revenue: 2500 },
  { month: 'May', revenue: 2300 },
  { month: 'Jun', revenue: 3200 },
  { month: 'Jul', revenue: 3500 },
  { month: 'Aug', revenue: 3700 },
  { month: 'Sep', revenue: 2500 },
  { month: 'Oct', revenue: 2800 },
  { month: 'Nov', revenue: 3000 },
  { month: 'Dec', revenue: 4800 },
];

const prisma = new PrismaClient();

async function checkIfDatabaseHasData() {
  return await prisma.invoice.count();
}

async function seedUsers() {
  const usersToCreate = await Promise.all(users.map(async (user) => ({
    email: user.email,
    password: await bcrypt.hash(user.password, 10),
    name: user.name,
  })));

  const data = await prisma.user.createMany({
    data: usersToCreate,
    skipDuplicates: true,
  });

  return data.count;
}

async function seedInvoices() {
  const dbCustomers = await prisma.customer.findMany();

  const data = await prisma.invoice.createMany({
    data: invoices.map((invoice) => ({
      amount: invoice.amount,
      customer_id: dbCustomers.find((customer) => customer.email === invoice.customer_email)?.id || 0,
      status: invoice.status,
      date: new Date(),
    })),
    skipDuplicates: true,
  });

  return data.count;
}

async function seedCustomers() {
  const data = await prisma.customer.createMany({
    data: customers.map((customer) => ({
      email: customer.email,
      image_url: customer.image_url,
      name: customer.name,
    })),
    skipDuplicates: true,
  });

  return data.count;
}

async function seedRevenue() {
  const data = await prisma.revenue.createMany({
    data: revenue.map((revenue) => ({
      month: revenue.month,
      revenue: revenue.revenue,
    })),
    skipDuplicates: true,
  });

  return data.count;
}

async function main() {
  const currentInvoicesCount = await checkIfDatabaseHasData();
  if (currentInvoicesCount) {
    console.log(`Database already seeded. Current invoices ${currentInvoicesCount}`);
    return;
  }

  const countUsers = await seedUsers();
  const countCustomers = await seedCustomers();
  const countInvoices = await seedInvoices();
  const countRevenue = await seedRevenue();

  console.log({
    users: countUsers,
    customers: countCustomers,
    invoices: countInvoices,
    revenue: countRevenue,
  });
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
