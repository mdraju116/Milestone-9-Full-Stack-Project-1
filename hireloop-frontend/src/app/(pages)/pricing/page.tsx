
const PricingPage = async ({searchParams,}: { searchParams: Promise<{ canceled?: string }>;}) => {
    const { canceled } = await searchParams;

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
            <div className="w-full max-w-md space-y-5">

                {/* Cancellation Message */}
                {canceled && (
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-400">
                        Your checkout was canceled. You can try again whenever you&apos;re ready.
                    </div>
                )}

                {/* Checkout Card */}
                <div className="rounded-2xl border border-white/10 bg-[#18191b] p-7 shadow-xl">

                    <div className="mb-6">
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                            PREMIUM PLAN
                        </span>

                        <h1 className="mt-4 text-2xl font-bold text-white">
                            Upgrade Your Experience
                        </h1>

                        <p className="mt-2 text-sm text-gray-400">
                            Get access to all premium features and enjoy more possibilities.
                        </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 border-b border-white/10 pb-6">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white">$19</span>
                            <span className="text-sm text-gray-400">/ month</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Billed monthly. Cancel anytime.
                        </p>
                    </div>

                   

                    {/* Checkout Form */}
                    <form action="/api/checkout_sessions" method="POST">
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-[#068a3f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#057535]"
                        >
                            Proceed to Checkout →
                        </button>
                    </form>

                    <p className="mt-4 text-center text-xs text-gray-500">
                        Secure checkout powered by Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
