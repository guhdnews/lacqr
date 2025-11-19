import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Blog() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <Header />

            <div className="bg-pink-50 py-24 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">The Lacqr Blog</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Tips, tricks, and industry insights for the modern nail tech.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "5 Signs You're Undercharging", date: "Nov 15, 2025", cat: "Business", img: "bg-pink-100" },
                        { title: "How to Handle 'How Much?' DMs", date: "Nov 10, 2025", cat: "Communication", img: "bg-blue-100" },
                        { title: "The Ultimate Guide to Nail Photography", date: "Nov 05, 2025", cat: "Marketing", img: "bg-purple-100" }
                    ].map((post, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className={`aspect-video ${post.img} rounded-3xl mb-6 overflow-hidden relative`}>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <span className="text-pink-600 font-bold uppercase tracking-wider">{post.cat}</span>
                                <span>•</span>
                                <span>{post.date}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-pink-600 transition-colors">{post.title}</h3>
                            <p className="text-gray-600">Read more about how to improve your business and skills...</p>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
