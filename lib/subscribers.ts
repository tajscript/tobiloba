import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addToNewsletter, sendNotificationEmail } from '@/lib/emailServices';

export function normalizeEmail(email: unknown) {
  const value = String(email ?? '').trim().toLowerCase();
  return /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(value) ? value : '';
}

/**
 * Signs an address up for the newsletter. Each subscriber is stored once, under
 * subscriptions/{email}; the rules only allow creating that document, so a
 * repeat sign-up is refused by Firestore and reported as already subscribed.
 * New subscribers are also added to Resend and, if `notify`, emailed to Tobi.
 */
export async function subscribe(email: string, source: 'newsletter' | 'contact form', notify = true) {
  const [saved, inResend] = await Promise.all([
    setDoc(doc(db, 'subscriptions', email), { email, source, subscribedAt: serverTimestamp(), status: 'active' }).then(
      () => 'new' as const,
      (error) => {
        if (error?.code === 'permission-denied') return 'existing' as const;
        console.error('Subscription save error:', error);
        return 'failed' as const;
      }
    ),
    addToNewsletter(email),
  ]);

  const emailed = saved !== 'existing' && notify ?(await sendNotificationEmail({ type: 'subscription', data: { email } })).success : false;

  return { alreadySubscribed: saved === 'existing', ok: saved !== 'failed' || inResend || emailed };
}
