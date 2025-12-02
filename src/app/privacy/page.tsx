import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6">
            <h1 className="text-4xl font-bold font-serif mb-8">Privacy Policy</h1>
            <p className="text-gray-500 mb-8">Last Updated: December 1, 2024</p>

            <div className="space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">1. Introduction</h2>
                    <p>
                        Lacqr (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website lacqr.io and use our mobile application (collectively, the &quot;Service&quot;).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">2. Information We Collect</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Personal Data:</strong> We collect personally identifiable information, such as your name, email address, and phone number, only when you voluntarily provide it to us during registration or when contacting support.</li>
                        <li><strong>Usage Data:</strong> We automatically collect information about your interactions with the Service, such as IP address, browser type, device information, and pages visited.</li>
                        <li><strong>Uploaded Content:</strong> Images of nails that you upload for analysis are processed to provide our services. We may store these images temporarily or permanently to improve our AI models, but we do not share them with third parties for marketing purposes.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">3. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Provide, operate, and maintain our Service.</li>
                        <li>Improve, personalize, and expand our Service.</li>
                        <li>Understand and analyze how you use our Service.</li>
                        <li>Develop new products, services, features, and functionality.</li>
                        <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">4. Data Retention and Deletion</h2>
                    <p>
                        We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. You can request deletion of your account and all associated data by contacting us at hello@lacqr.io or using the &quot;Delete Account&quot; feature in your settings.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">5. Security of Your Data</h2>
                    <p>
                        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">6. Third-Party Services</h2>
                    <p>
                        We may employ third-party companies and individuals to facilitate our Service (&quot;Service Providers&quot;), to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                    </p>
                    <p className="mt-2">
                        <strong>Google User Data:</strong> If you choose to authenticate using Google Sign-In, we access your basic profile information (name, email, profile picture) solely for authentication and account creation purposes. We do not access your contacts, calendar, or other Google data.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>By email: hello@lacqr.io</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
