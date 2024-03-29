import { PrismaClient } from '@prisma/client'
import {
  CustomerField,
  CustomersTableType,
  FormattedCustomersTable,
  InvoiceForm,
  InvoicesTable,
} from './definitions';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();

export async function fetchRevenue() {
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();

  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.revenue.findMany();

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  noStore();
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = await prisma.invoice.findMany({
      take: 5,
      orderBy: {
        date: 'desc'
      },
      include: {
        customer: true,
      }
    });

    const latestInvoices = data.map((invoice) => ({
      id: String(invoice.id),
      name: invoice.customer.name,
      image_url: invoice.customer.image_url,
      email: invoice.customer.email,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const invoiceCountPromise = prisma.invoice.count();
    const customerCountPromise = prisma.customer.count();
    const invoiceStatusPromise = prisma.$queryRaw<{ paid: number, pending: number }[]>`SELECT
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
          FROM "Invoice"`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0] ?? '0');
    const numberOfCustomers = Number(data[1] ?? '0');

    const { paid, pending } = data[2][0];
    const totalPaidInvoices = formatCurrency(Number(paid) ?? '0');
    const totalPendingInvoices = formatCurrency(Number(pending) ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.$queryRaw<InvoicesTable[]>`
      SELECT
        i.id,
        i.amount,
        i.date,
        i.status,
        c.name,
        c.email,
        c.image_url
      FROM "Invoice" i
      JOIN "Customer" c ON i.customer_id = c.id
      WHERE
        c.name ILIKE ${`%${query}%`} OR
        c.email ILIKE ${`%${query}%`} OR
        i.amount::text ILIKE ${`%${query}%`} OR
        i.date::text ILIKE ${`%${query}%`} OR
        i.status ILIKE ${`%${query}%`}
      ORDER BY i.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore();
  try {
    const data = await prisma.$queryRaw<{ count: number }[]>`SELECT COUNT(*)
      FROM "Invoice" i
      JOIN "Customer" c ON i.customer_id = c.id
      WHERE
        c.name ILIKE ${`%${query}%`} OR
        c.email ILIKE ${`%${query}%`} OR
        i.amount::text ILIKE ${`%${query}%`} OR
        i.date::text ILIKE ${`%${query}%`} OR
        i.status ILIKE ${`%${query}%`}
    `;

    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: number) {
  noStore();
  try {
    const data = await prisma.invoice.findFirst({
      where: {
        id,
      },
    });

    if (!data) {
      return null;
    }

    const invoice: InvoiceForm = {
      id: `${data.id}`,
      customer_id: `${data.customer_id}`,
      // Convert amount from cents to dollars
      amount: data.amount / 100,
      status: data.status === 'paid' ? 'paid' : 'pending',
    };

    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers(): Promise<CustomerField[]> {
  try {
    const data = await prisma.customer.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return data.map((customer) => ({ id: `${customer.id}`, name: customer.name }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchCustomersPages(query: string): Promise<number> {
  noStore();
  try {
    const data = await prisma.$queryRaw<{ count: number }[]>`SELECT COUNT(*)
      FROM "Customer" c
      WHERE
        c.name ILIKE ${`%${query}%`} OR
        c.email ILIKE ${`%${query}%`}
    `;

    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchFilteredCustomers(query: string, currentPage: number): Promise<FormattedCustomersTable[]> {
  noStore();
  try {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.$queryRaw<CustomersTableType[]>`
      SELECT
        c.id,
        c.name,
        c.email,
        c.image_url,
        COUNT(i.id) AS total_invoices,
        SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) AS total_paid
      FROM "Customer" c
      LEFT JOIN "Invoice" i ON c.id = i.customer_id
      WHERE
        c.name ILIKE ${`%${query}%`} OR
          c.email ILIKE ${`%${query}%`}
      GROUP BY c.id, c.name, c.email, c.image_url
      ORDER BY c.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;

    return data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(Number(customer.total_pending)),
      total_paid: formatCurrency(Number(customer.total_paid)),
      total_invoices: Number(customer.total_invoices)
    }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {
    const data = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
