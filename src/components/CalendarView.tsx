import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Booking {
    id: string;
    clientName: string;
    data: {
        base: { system: string; length: string };
        estimatedDuration?: number;
    };
    status: 'pending' | 'accepted' | 'declined';
    createdAt: any; // Firestore Timestamp
    appointmentDate?: any; // Future feature: Actual appointment date
}

interface CalendarViewProps {
    bookings: Booking[];
    onBookingClick: (booking: Booking) => void;
}

export default function CalendarView({ bookings, onBookingClick }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getBookingsForDay = (day: Date) => {
        return bookings.filter(booking => {
            // For MVP, we're using createdAt as the "date". 
            // In reality, we need an 'appointmentDate' field.
            // If appointmentDate exists, use it. Otherwise fallback to createdAt for demo.
            const date = booking.appointmentDate?.toDate ? booking.appointmentDate.toDate() :
                booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);

            return isSameDay(date, day);
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={goToToday} className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                        Today
                    </button>
                    <div className="flex items-center bg-gray-50 rounded-lg p-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-px">
                {days.map((day, dayIdx) => {
                    const dayBookings = getBookingsForDay(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toString()}
                            className={`
                                min-h-[100px] bg-white p-2 transition-colors hover:bg-gray-50
                                ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : ''}
                                ${isToday(day) ? 'bg-pink-50/10' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`
                                    text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                                    ${isToday(day) ? 'bg-pink-500 text-white' : 'text-gray-700'}
                                `}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="space-y-1">
                                {dayBookings.map(booking => (
                                    <button
                                        key={booking.id}
                                        onClick={() => onBookingClick(booking)}
                                        className={`
                                            w-full text-left px-2 py-1 rounded-md text-[10px] font-bold truncate flex items-center gap-1 transition-transform hover:scale-105
                                            ${booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'declined' ? 'bg-red-50 text-red-400 line-through opacity-50' :
                                                    'bg-yellow-100 text-yellow-700'}
                                        `}
                                    >
                                        {booking.status === 'accepted' && <CheckCircle size={8} />}
                                        {booking.status === 'pending' && <Clock size={8} />}
                                        {booking.status === 'declined' && <XCircle size={8} />}
                                        {booking.clientName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
