import InteractionHistory from '../components/InteractionHistory';

// ... (imports)

export default function ClientProfile() {
    // ... (state)
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'interactions'>('overview');

    // ... (rest of code)

    {/* Tabs */ }
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
        >
            Overview
        </button>
        <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
        >
            History
        </button>
        <button
            onClick={() => setActiveTab('interactions')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'interactions' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
        >
            Interactions
        </button>
    </div>

    {/* Overview Tab */ }
    {
        activeTab === 'overview' && (
                // ... (overview content)
            )
    }

    {/* History Tab */ }
    {
        activeTab === 'history' && (
                // ... (history content)
            )
    }

    {/* Interactions Tab */ }
    {
        activeTab === 'interactions' && (
            <InteractionHistory clientId={id!} />
        )
    }
        </div >
    );
}
