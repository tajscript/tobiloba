import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendNotificationEmail } from '@/lib/emailServices';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, message, receiveNewsletters } = await request.json();

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Save to Firebase
    const contactData = {
      firstName,
      lastName,
      email,
      message,
      receiveNewsletters,
      submittedAt: serverTimestamp(),
      status: 'new'
    };

    const docRef = await addDoc(collection(db, 'contacts'), contactData);

    // Send notification email
    await sendNotificationEmail({
      type: 'contact',
      data: { firstName, lastName, email, message, receiveNewsletters }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!',
      id: docRef.id 
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}