'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

const FormSchema = z.object({
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.date(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;

  const invoice = await prisma.invoice.create({
    data: {
      customer_id: Number(customerId),
      amount: amountInCents,
      status: status,
      date: new Date().toISOString(),
    }
  });

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
