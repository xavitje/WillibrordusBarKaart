import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      const clientReferenceId = session.client_reference_id;
      if (clientReferenceId) {
        // Our format is ${userId}:${cardTypeId}
        const [userId, cardTypeId] = clientReferenceId.split(':');
        
        if (userId && cardTypeId) {
          const cardType = await prisma.barCardType.findUnique({
            where: { id: cardTypeId }
          });
          
          if (cardType) {
            await prisma.ownedCard.create({
              data: {
                userId: userId,
                barCardTypeId: cardTypeId,
                remainingUnits: cardType.capacity,
              }
            });
            console.log(`[Stripe Webhook] Successfully added card ${cardType.name} to user ${userId}`);
          } else {
            console.error(`[Stripe Webhook] BarCardType ${cardTypeId} not found.`);
          }
        }
      } else {
        console.error(`[Stripe Webhook] Missing client_reference_id in checkout session.`);
      }
      break;
    default:
      console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
  }

  return new NextResponse('Success', { status: 200 });
}
