import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc, writeBatch, getDocs, limit } from 'firebase/firestore';

export interface Notification {
    id: string;
    type: 'booking_request' | 'booking_update' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: any; // Firestore Timestamp
    link?: string;
}

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    initialized: boolean;
    userId: string | null;

    // Actions
    initialize: (userId: string) => () => void; // Returns unsubscribe function
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    initialized: false,
    userId: null,

    initialize: (userId: string) => {
        // If already initialized for this user, do nothing
        if (get().initialized && get().userId === userId) return () => { };

        set({ loading: true, userId });

        const q = query(
            collection(db, `users/${userId}/notifications`),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];

            const unreadCount = notifications.filter(n => !n.read).length;

            set({
                notifications,
                unreadCount,
                loading: false,
                initialized: true
            });
        }, (error) => {
            console.error("Error listening to notifications:", error);
            set({ loading: false });
        });

        return unsubscribe;
    },

    markAsRead: async (notificationId: string) => {
        const { userId, notifications } = get();
        if (!userId) return;

        // Optimistic update
        const updatedNotifications = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        set({ notifications: updatedNotifications, unreadCount });

        // Firestore update
        try {
            const notifRef = doc(db, `users/${userId}/notifications`, notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
            // Revert on error? For now, keep UI optimistic.
        }
    },

    markAllAsRead: async () => {
        const { userId, notifications } = get();
        if (!userId) return;

        // Optimistic update
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        set({ notifications: updatedNotifications, unreadCount: 0 });

        // Firestore update (Batch)
        try {
            const batch = writeBatch(db);
            const unreadDocs = notifications.filter(n => !n.read);

            unreadDocs.forEach(n => {
                const ref = doc(db, `users/${userId}/notifications`, n.id);
                batch.update(ref, { read: true });
            });

            if (unreadDocs.length > 0) {
                await batch.commit();
            }
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    },

    deleteNotification: async (notificationId: string) => {
        const { userId, notifications } = get();
        if (!userId) return;

        // Optimistic update
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        set({ notifications: updatedNotifications, unreadCount });

        // Firestore update
        try {
            const notifRef = doc(db, `users/${userId}/notifications`, notificationId);
            await deleteDoc(notifRef);
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    }
}));
