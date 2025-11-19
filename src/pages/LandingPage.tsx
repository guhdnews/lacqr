{/* FAQ Section */ }
            <section id="faq" className="py-24 px-6 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: "How accurate is the pricing AI?", a: "Our AI is trained on thousands of nail designs. It's highly accurate at identifying components, but you always have the final say to adjust the price before sending it." },
                            { q: "Can I use my own price list?", a: "Yes! In the Pro plan, you can upload your specific service menu prices so the AI quotes match your salon's rates exactly." },
                            { q: "Does it work for all nail shapes?", a: "Absolutely. QuoteCam recognizes all standard shapes (Almond, Coffin, Square, Stiletto) and lengths." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                                <h4 className="font-bold text-lg mb-2">{item.q}</h4>
                                <p className="text-gray-600">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div >
    );
}
