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

    const docRef = await addDoc(collection(db, 'subscriptions'), subscriptionData);

    // Send notification email
    await sendNotificationEmail({
      type: 'subscription',
      data: { email }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed!',
      id: docRef.id 
    });
    
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}