import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-11-17.clover' as any, // Force version to match types if needed, or just use string. The error says types expect this specific string.
});

export async function POST(request: Request) {
    try {
        const { amount, currency, salonId, bookingId } = await request.json();

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("❌ STRIPE_SECRET_KEY is missing in environment variables.");
            return NextResponse.json(
                { error: "Payment configuration error (Missing Key)" },
                { status: 500 }
            );
        }

        // Validate amount (must be at least $0.50 equivalent)
        if (!amount || amount < 50) {
            return NextResponse.json(
                { error: "Invalid amount (minimum $0.50)" },
                { status: 400 }
            );
        }

        console.log(`💰 Creating Payment Intent: ${amount} ${currency} for Salon: ${salonId}`);

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Stripe expects integers (cents)
            currency: currency || 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                salonId,
                bookingId,
                type: 'deposit'
            },
            // Application Fee (Optional: Lacqr takes 1%)
            // application_fee_amount: Math.round(amount * 0.01),
            // transfer_data: {
            //     destination: 'acct_...', // Salon's connected account ID (Need to fetch this from Firestore user doc)
            // },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error: any) {
        console.error("❌ Error creating payment intent:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
