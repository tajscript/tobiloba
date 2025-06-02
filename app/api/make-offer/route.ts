import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendNotificationEmail } from '@/lib/emailServices';

export async function POST(request: NextRequest) {
  try {
    const { offer, email, country, region, artTitle, artPrice } = await request.json();

    if (!offer || !email || !country || !region || !artTitle) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Save to Firebase
    const offerData = {
      offer: Number(offer),
      email,
      country,
      region,
      artTitle,
      artPrice: Number(artPrice),
      submittedAt: serverTimestamp(),
      status: 'pending'
    };

    const docRef = await addDoc(collection(db, 'offers'), offerData);

    // Send notification email
    await sendNotificationEmail({
      type: 'offer',
      data: { offer, email, country, region, artTitle, artPrice }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Offer submitted successfully!',
      id: docRef.id 
    });
    
  } catch (error) {
    console.error('Offer submission error:', error);
    return NextResponse.json({ error: 'Failed to submit offer' }, { status: 500 });
  }
}