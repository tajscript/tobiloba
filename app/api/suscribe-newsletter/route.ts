import { NextRequest, NextResponse } from 'next/server';
import { normalizeEmail, subscribe } from '@/lib/subscribers';

export async function POST(request: NextRequest) {
  try {
    const email = normalizeEmail((await request.json()).email);

    if (!email) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const { ok, alreadySubscribed } = await subscribe(email, 'newsletter');

    if (!ok) {
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alreadySubscribed,
      message: alreadySubscribed ? "You're already subscribed." : 'Successfully subscribed!',
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
