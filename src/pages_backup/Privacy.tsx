import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <Header />
            <div className="max-w-4xl mx-auto px-6 py-24">
                <h1 className="text-4xl font-serif font-bold mb-8">Privacy Policy</h1>
                <p className="text-gray-600 mb-8">Last updated: November 18, 2025</p>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">1. Introduction</h2>
                        <p>Welcome to Lacqr ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and use our services.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">2. Data We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes email address and telephone number.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                            <li><strong>Usage Data:</strong> includes information about how you use our website, products and services (including photos uploaded for QuoteCam).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">3. How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>To provide the QuoteCam and Service Sorter features.</li>
                            <li>To manage your account and subscription.</li>
                            <li>To improve our AI models (anonymized data only).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">4. Data Security</h2>
                        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-charcoal mb-4">5. Contact Us</h2>
                        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:privacy@lacqr.io" className="text-pink-600 hover:underline">privacy@lacqr.io</a></p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}
