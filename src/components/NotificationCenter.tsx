import { useState, useRef, useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (id: string, link?: string) => {
        await markAsRead(id);
        if (link) {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-charcoal hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Popover */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-charcoal">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-xs font-medium text-pink-500 hover:text-pink-600 flex items-center gap-1"
                                >
                                    <Check size={14} /> Mark all read
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors relative group ${!notification.read ? 'bg-pink-50/30' : ''}`}
                                    >
                                        <Link
                                            href={notification.link || '#'}
                                            onClick={() => handleNotificationClick(notification.id, notification.link)}
                                            className="block pr-8"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm ${!notification.read ? 'font-bold text-charcoal' : 'font-medium text-gray-700'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                    {notification.createdAt?.toDate ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
                                        </Link>

                                        {/* Delete Button (Visible on Hover) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="absolute top-4 right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>

                                        {/* Unread Indicator */}
                                        {!notification.read && (
                                            <div className="absolute top-5 left-2 w-1.5 h-1.5 bg-pink-500 rounded-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
