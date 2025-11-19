import Footer from '../components/Footer';

export default function Blog() {
    const posts = [
        { title: "How to Stop Undercharging for Nail Art", date: "Nov 15, 2024", category: "Business" },
        { title: "The Ultimate Guide to Gel-X Pricing", date: "Nov 10, 2024", category: "Pricing" },
        { title: "5 Ways to Fire a Client Politely", date: "Nov 05, 2024", category: "Client Management" }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <div className="max-w-7xl mx-auto px-6 py-24">
                <h1 className="text-5xl font-serif font-bold mb-12 text-center">The Lacqr Blog</h1>
                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((post, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="bg-gray-100 rounded-2xl h-64 mb-6 group-hover:opacity-90 transition-opacity"></div>
                            <div className="text-pink-500 text-sm font-bold mb-2">{post.category}</div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-pink-600 transition-colors">{post.title}</h3>
                            <p className="text-gray-400 text-sm">{post.date}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
