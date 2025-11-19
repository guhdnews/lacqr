import Footer from '../components/Footer';

export default function About() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <div className="max-w-4xl mx-auto px-6 py-24">
                <h1 className="text-5xl font-serif font-bold mb-8 text-center">Built for Techs, by Techs.</h1>
                <p className="text-xl text-gray-600 text-center mb-16 leading-relaxed">
                    We believe nail artistry is undervalued. Lacqr exists to help you get paid what you're worth, without the awkward money conversations.
                </p>

                <div className="prose prose-lg mx-auto text-gray-600">
                    <p>
                        Lacqr started with a simple frustration: "How much for this?" It's the question every nail tech dreads.
                        Calculating costs for complex designs on the fly is stressful, and undercharging is rampant in our industry.
                    </p>
                    <p className="mt-6">
                        We built QuoteCam to be the objective third party. It sees the work—the chrome, the gems, the hand-painted details—and
                        assigns value to every stroke. It empowers you to stand by your prices with confidence.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
