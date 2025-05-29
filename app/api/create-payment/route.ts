import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, items, customerInfo } = await request.json();

    // Validate the request
    if (!amount || !currency || !items || !customerInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer;
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: customerInfo.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customerInfo.email,
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          phone: customerInfo.phone,
          address: {
            line1: customerInfo.address,
            city: customerInfo.city,
            state: customerInfo.state,
            postal_code: customerInfo.postalCode,
            country: customerInfo.country === 'Nigeria' ? 'NG' : customerInfo.country,
          },
        });
      }
    } catch (error) {
      console.error('Error handling customer:', error);
      // Continue without customer if there's an error
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      customer: customer?.id,
      metadata: {
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        itemCount: items.length.toString(),
        itemDetails: JSON.stringify(items.map((item: any) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          type: item.type
        }))),
      },
      shipping: {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        address: {
          line1: customerInfo.address,
          city: customerInfo.city,
          state: customerInfo.state,
          postal_code: customerInfo.postalCode,
          country: customerInfo.country === 'Nigeria' ? 'NG' : customerInfo.country,
        },
      },
      receipt_email: customerInfo.email,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}