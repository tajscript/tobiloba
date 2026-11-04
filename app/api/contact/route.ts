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

    // Save and notify independently: the message has arrived if either one works.
    const [saved, emailed] = await Promise.all([
      addDoc(collection(db, 'contacts'), contactData).then(
        (docRef) => docRef.id,
        (error) => {
          console.error('Contact form save error:', error);
          return null;
        }
      ),
      sendNotificationEmail({
        type: 'contact',
        data: { firstName, lastName, email, message, receiveNewsletters }
      }),
    ]);

    if (!saved && !emailed.success) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!',
      id: saved 
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}