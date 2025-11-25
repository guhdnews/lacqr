export interface ClientHistory {
    id: string;
    date: any; // Firestore Timestamp or Date
    service: string;
    price: number;
    notes?: string;
    image?: string; // URL to the inspiration or result image
}

export interface Client {
    id: string;
    userId: string;
    name: string;
    email?: string;
    phone?: string;
    instagram?: string;
    avatar?: string; // Initials or image URL
    notes?: string; // Private notes for the tech
    history?: ClientHistory[];
    tags?: string[]; // e.g., "VIP", "Nail Biter", "Late"
    createdAt: any; // Firestore Timestamp
    lastVisit?: any; // Firestore Timestamp
    totalSpent?: number;
}

export const MOCK_CLIENTS: Client[] = [
    {
        id: '1',
        userId: 'mock-user',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '(555) 123-4567',
        instagram: '@sarahj_nails',
        notes: 'Prefers almond shape. Sensitive cuticles.',
        tags: ['VIP', 'Regular'],
        createdAt: new Date('2023-01-15'),
        lastVisit: new Date('2023-10-15'),
        totalSpent: 130,
        history: [
            { id: 'h1', date: new Date('2023-10-15'), service: 'Gel-X Full Set', price: 85, notes: 'Loved the chrome finish.' },
            { id: 'h2', date: new Date('2023-09-01'), service: 'Gel Manicure', price: 45 }
        ]
    },
    {
        id: '2',
        userId: 'mock-user',
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        phone: '(555) 987-6543',
        notes: 'Always late. Loves 3D charms.',
        tags: ['Late'],
        createdAt: new Date('2023-05-20'),
        lastVisit: new Date('2023-11-01'),
        totalSpent: 60,
        history: [
            { id: 'h3', date: new Date('2023-11-01'), service: 'Acrylic Fill', price: 60 }
        ]
    }
];
