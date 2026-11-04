import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendNotificationEmail } from '@/lib/emailServices';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Save to Firebase
    const subscriptionData = {
      email,
      subscribedAt: serverTimestamp(),
      status: 'active'
    };

    // Save and notify independently: the sign-up has arrived if either one works.
    const [saved, emailed] = await Promise.all([
      addDoc(collection(db, 'subscriptions'), subscriptionData).then(
        (docRef) => docRef.id,
        (error) => {
          console.error('Subscription save error:', error);
          return null;
        }
      ),
      sendNotificationEmail({
        type: 'subscription',
        data: { email }
      }),
    ]);

    if (!saved && !emailed.success) {
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed!',
      id: saved 
    });
    
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}