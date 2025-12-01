import React from 'react';

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6">
            <h1 className="text-4xl font-bold font-serif mb-8">Terms of Service</h1>
            <p className="text-gray-500 mb-8">Last Updated: December 1, 2024</p>

            <div className="space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the Lacqr website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">2. Use License</h2>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (information or software) on Lacqr's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>modify or copy the materials;</li>
                        <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                        <li>attempt to decompile or reverse engineer any software contained on Lacqr's website;</li>
                        <li>remove any copyright or other proprietary notations from the materials; or</li>
                        <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">3. Disclaimer</h2>
                    <p>
                        The materials on Lacqr's website are provided on an 'as is' basis. Lacqr makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">4. Limitations</h2>
                    <p>
                        In no event shall Lacqr or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Lacqr's website, even if Lacqr or a Lacqr authorized representative has been notified orally or in writing of the possibility of such damage.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">5. Accuracy of Materials</h2>
                    <p>
                        The materials appearing on Lacqr's website could include technical, typographical, or photographic errors. Lacqr does not warrant that any of the materials on its website are accurate, complete or current. Lacqr may make changes to the materials contained on its website at any time without notice. However Lacqr does not make any commitment to update the materials.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">6. Governing Law</h2>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws of the State of Delaware and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-charcoal">7. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at hello@lacqr.io.
                    </p>
                </section>
            </div>
        </div>
    );
}
