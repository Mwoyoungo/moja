'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

interface TicketData {
    id: string;
    eventId: string;
    price: number;
    status: string;
}

interface EventData {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    videoUrl: string;
    tickets: any[];
}

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<EventData[]>([]);
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // 1. Fetch My Events
                const qEvents = query(
                    collection(db, 'events'),
                    where("organizerId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const eventSnap = await getDocs(qEvents);
                const fetchedEvents = eventSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as EventData[];
                setEvents(fetchedEvents);

                // 2. Fetch Tickets for these events
                // Note: handling "in" query limits (max 10). For MVP this loop is fine.
                if (fetchedEvents.length > 0) {
                    const eventIds = fetchedEvents.map(e => e.id);
                    // Firestore "in" filter is limited to 10. 
                    // For scalability we might search ticket collection by organizerId if we duplicated that data.
                    // For MVP, we'll fetch all tickets for these events.

                    const qTickets = query(collection(db, 'tickets'), where("eventId", "in", eventIds.slice(0, 10)));
                    const ticketSnap = await getDocs(qTickets);
                    const fetchedTickets = ticketSnap.docs.map(doc => ({
                        id: doc.id,
                        eventId: doc.data().eventId,
                        price: doc.data().price,
                        status: doc.data().status
                    })) as TicketData[];
                    setTickets(fetchedTickets);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Stats Calculation
    const totalRevenue = tickets.reduce((sum, t) => sum + t.price, 0);
    const totalTicketsSold = tickets.length;
    // const totalAttendees = tickets.filter(t => t.status === 'SCANNED').length;

    if (!user && !loading) {
        return (
            <div className="bg-background-dark min-h-screen flex flex-col items-center justify-center text-white px-6">
                <p className="mb-4">Please log in to manage your events.</p>
                <button onClick={() => router.push('/auth/login')} className="bg-primary text-background-dark px-6 py-2 rounded-full font-bold">
                    Log In
                </button>
            </div>
        );
    }

    return (
        <div className="bg-background-dark min-h-screen text-white font-display pb-32">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-5 bg-background-dark/90 backdrop-blur-md border-b border-white/5">
                <h1 className="text-xl font-bold tracking-tight">Organizer Hub</h1>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center">
                        <span className="text-xs font-bold">{user?.displayName?.[0] || 'Me'}</span>
                    </div>
                </div>
            </nav>

            <main className="px-6 py-6 max-w-md mx-auto space-y-8">

                {/* 1. Hero Stats Carousel */}
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
                    {/* Revenue Card */}
                    <div className="min-w-[240px] h-32 rounded-2xl p-5 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden snap-center">
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 text-white/80">
                                <span className="material-symbols-outlined text-[20px]">payments</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                            </div>
                            <h2 className="text-3xl font-bold">R {totalRevenue.toLocaleString()}</h2>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
                    </div>

                    {/* Sales Card */}
                    <div className="min-w-[240px] h-32 rounded-2xl p-5 bg-gradient-to-br from-pink-500 to-orange-500 relative overflow-hidden snap-center">
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 text-white/80">
                                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Tickets Sold</span>
                            </div>
                            <h2 className="text-3xl font-bold">{totalTicketsSold}</h2>
                        </div>
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    </div>
                </div>

                {/* 2. My Events List */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg">My Events</h2>
                        <Link href="/create">
                            <button className="text-xs font-bold text-primary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Create New
                            </button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-10 opacity-50 bg-surface rounded-2xl border border-dashed border-white/10">
                                <p>No events yet.</p>
                                <p className="text-sm">Create your first experience!</p>
                            </div>
                        ) : (
                            events.map(event => {
                                const eventTickets = tickets.filter(t => t.eventId === event.id);
                                const eventRevenue = eventTickets.reduce((sum, t) => sum + t.price, 0);

                                return (
                                    <div key={event.id} className="bg-surface rounded-2xl p-4 border border-white/5 active:scale-[0.99] transition-transform">
                                        <div className="flex gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-20 h-24 rounded-lg bg-black overflow-hidden shrink-0 relative">
                                                {event.videoUrl ? (
                                                    <video src={event.videoUrl} className="w-full h-full object-cover opacity-80" muted />
                                                ) : (
                                                    <div className="w-full h-full bg-white/5"></div>
                                                )}
                                                <div className="absolute inset-0 bg-black/20"></div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex flex-col flex-1 justify-between py-1">
                                                <div>
                                                    <h3 className="font-bold text-white leading-tight mb-1">{event.title}</h3>
                                                    <p className="text-xs text-muted-grey flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                        {event.date}
                                                    </p>
                                                </div>

                                                <div className="flex items-end justify-between mt-2">
                                                    <div>
                                                        <p className="text-[10px] text-muted-grey uppercase font-bold tracking-wider">Revenue</p>
                                                        <p className="text-primary font-bold">R {eventRevenue.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-grey uppercase font-bold tracking-wider text-right">Sold</p>
                                                        <p className="text-white font-bold text-right">{eventTickets.length}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                                            <button className="py-2.5 rounded-lg bg-white/5 text-xs font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                                Edit
                                            </button>
                                            <Link href={`/dashboard/guestlist/${event.id}`}>
                                                <button className="w-full py-2.5 rounded-lg bg-white/5 text-xs font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]">group</span>
                                                    Guestlist
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}

