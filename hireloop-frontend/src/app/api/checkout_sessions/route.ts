import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../lib/stripe'

export async function POST() {
    try {
        const headersList = await headers()
        const origin = headersList.get('origin')

        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    // Provide the exact Price ID (for example, price_1234) of the product you want to sell
                    price: 'price_1UbGcDGs6plR5djCifc4C1JJ',
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
            // Provide a name (for example, hosted_web_0001) to label this Checkout integration and measure its conversion independently
            integration_identifier: 'hireloop_web_001',
        });

        if (!session.url) {
            return NextResponse.json(
                { error: 'Checkout session URL is unavailable' },
                { status: 500 }
            )
        }

        return NextResponse.redirect(session.url, 303)

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Checkout failed'
        const statusCode =
            typeof err === 'object' && err !== null && 'statusCode' in err &&
                typeof err.statusCode === 'number'
                ? err.statusCode
                : 500

        return NextResponse.json(
            { error: message },
            { status: statusCode }
        )
    }
}