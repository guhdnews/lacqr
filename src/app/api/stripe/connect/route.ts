import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { adminAuth } from '@/lib/firebase-admin';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-04-10', // Use latest stable version
});

export async function POST(request: Request) {
    try {
        // 1. Verify Auth Token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const { email, name } = await request.json();

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('Stripe Secret Key is missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // 2. Check if user already has a Stripe Account ID in Firestore
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userSnap.data();
        let accountId = userData.stripeAccountId;

        // 3. If no account ID, create one
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US', // Default to US for now
                email: email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
                business_profile: {
                    name: name || 'Lacqr Nail Tech',
                    product_description: 'Nail Services',
                },
            });

            accountId = account.id;

            // Save to Firestore
            await updateDoc(userRef, {
                stripeAccountId: accountId,
                stripeConnected: false // Will be updated to true after successful onboarding check
            });
        }

        // 4. Create Account Link for onboarding
        const origin = request.headers.get('origin') || 'http://localhost:3000';
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/dashboard/settings/booking?stripe_refresh=true`,
            return_url: `${origin}/dashboard/settings/booking?stripe_return=true`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });

    } catch (error: any) {
        console.error('Stripe Connect Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
