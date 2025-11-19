import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <Header />
            <div className="max-w-4xl mx-auto px-6 py-24">
                <h1 className="text-4xl font-serif font-bold mb-8">Terms of Service</h1>
                <p className="text-gray-600 mb-8">Last updated: November 18, 2025</p>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">1. Agreement to Terms</h2>
                        <p>By accessing our website and using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access the service.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">2. Description of Service</h2>
                        <p>Lacqr provides AI-powered tools for nail technicians, including pricing estimation (QuoteCam) and service sorting. These tools are for informational purposes and business assistance only.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">3. User Accounts</h2>
                        <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">4. Intellectual Property</h2>
                        <p>The Service and its original content (excluding Content provided by you or other users), features and functionality are and will remain the exclusive property of Lacqr and its licensors.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">5. Termination</h2>
                        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">6. Limitation of Liability</h2>
                        <p>In no event shall Lacqr, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">7. Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us at: <a href="mailto:legal@lacqr.io" className="text-pink-600 hover:underline">legal@lacqr.io</a></p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}
