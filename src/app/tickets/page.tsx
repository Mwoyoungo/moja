'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import BottomNav from '@/components/BottomNav';

interface TicketData {
    id: string;
    eventTitle: string;
    eventDate: string;
    eventVenue: string;
    ticketName: string;
    qrCodeHash: string;
    status: string;
}

export default function TicketsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchTickets = async () => {
            try {
                // Fetch tickets for the logged-in user
                const q = query(
                    collection(db, 'tickets'),
                    where("userId", "==", user.uid),
                    orderBy("purchaseDate", "desc") // Ensure index exists or remove orderBy if it fails initially
                );

                const querySnapshot = await getDocs(q);
                const fetchedTickets = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TicketData[];

                setTickets(fetchedTickets);
            } catch (error) {
                console.error("Error fetching tickets:", error);
                // Fallback for missing index error
                try {
                    const q2 = query(collection(db, 'tickets'), where("userId", "==", user.uid));
                    const snap2 = await getDocs(q2);
                    const tickets2 = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TicketData[];
                    setTickets(tickets2);
                } catch (e) {
                    console.error("Fallback fetch failed", e);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [user]);

    if (!user && !loading) {
        return (
            <div className="bg-background-dark min-h-screen flex flex-col items-center justify-center text-white px-6">
                <p className="mb-4">Please log in to view your tickets.</p>
                <button onClick={() => router.push('/auth/login')} className="bg-primary text-background-dark px-6 py-2 rounded-full font-bold">
                    Log In
                </button>
                <BottomNav />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-background-dark min-h-screen flex flex-col items-center justify-center text-white px-6">
                <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p>Loading Tickets...</p>
                <BottomNav />
            </div>
        );
    }

    const latestTicket = tickets.length > 0 ? tickets[0] : null;
    const otherTickets = tickets.slice(1);

    return (
        <div className="bg-background-dark min-h-screen text-white font-display selection:bg-primary/30 pb-32">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-background-dark/80 backdrop-blur-md">
                <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/50 border border-white/5 hover:bg-surface transition-colors">
                    <span className="material-symbols-outlined text-white text-[22px]">chevron_left</span>
                </button>
                <h1 className="text-white text-lg font-semibold tracking-tight">My Tickets</h1>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/50 border border-white/5 hover:bg-surface transition-colors">
                    <span className="material-symbols-outlined text-white text-[22px]">more_horiz</span>
                </button>
            </nav>

            <main className="px-6 max-w-md mx-auto">
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 opacity-50">
                        <span className="material-symbols-outlined text-6xl mb-4">confirmation_number</span>
                        <p>No tickets found.</p>
                        <p className="text-xs mt-2">Go buy some tickets!</p>
                    </div>
                ) : (
                    <>
                        {/* Active Ticket Section Header */}
                        {latestTicket && (
                            <>
                                <div className="mt-6 mb-4 flex items-center justify-between">
                                    <h2 className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Priority Entry</h2>
                                    <div className="h-[1px] flex-grow ml-4 bg-white/5"></div>
                                </div>

                                {/* Hero Active Ticket Card */}
                                <div className="relative group cursor-pointer">
                                    <div className="bg-surface rounded-xl overflow-hidden border border-white/5 shadow-[0_0_20px_rgba(198,183,226,0.03)] transition-all duration-300 active:scale-[0.98]">
                                        {/* Event Image Placeholder */}
                                        <div className="h-48 w-full bg-center bg-cover relative bg-primary/10">
                                            <div className="w-full h-full bg-gradient-to-t from-surface via-transparent to-transparent"></div>
                                        </div>

                                        <div className="px-6 pb-6 -mt-12 relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${latestTicket.status === 'SCANNED' ? 'bg-red-500/20 text-red-400' : 'bg-primary text-background-dark'} uppercase tracking-wider w-fit`}>
                                                        {latestTicket.status === 'SCANNED' ? 'Used' : 'Valid'}
                                                    </span>
                                                    <h3 className="text-white text-2xl font-bold leading-tight tracking-tight mt-2">{latestTicket.eventTitle}</h3>
                                                    <p className="text-muted-grey text-sm font-normal">{latestTicket.eventVenue}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-3 text-muted-grey">
                                                    <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                                                    <span className="text-sm">{latestTicket.eventDate}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-muted-grey">
                                                    <span className="material-symbols-outlined text-primary text-sm">confirmation_number</span>
                                                    <span className="text-sm">{latestTicket.ticketName} • {latestTicket.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>

                                            {/* Dynamic QR Code Section */}
                                            <div className="mt-8 p-6 bg-[#0F0F12] rounded-xl border border-white/5 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(198, 183, 226, 0.1) 0%, rgba(198, 183, 226, 0.02) 100%)' }}>
                                                <div className="w-40 h-40 bg-white p-2 rounded-lg mb-4">
                                                    {/* Using QuickChart API for QR Code */}
                                                    <img
                                                        alt="Ticket QR Code"
                                                        className="w-full h-full"
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${latestTicket.id}`}
                                                    />
                                                </div>
                                                <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-medium">Scan at Entrance</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* List Section Header */}
                        {otherTickets.length > 0 && (
                            <>
                                <div className="mt-12 mb-6 flex items-center justify-between">
                                    <h2 className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Other Tickets</h2>
                                    <div className="h-[1px] flex-grow ml-4 bg-white/5"></div>
                                </div>

                                {/* Secondary Tickets List */}
                                <div className="flex flex-col gap-4">
                                    {otherTickets.map(ticket => (
                                        <div key={ticket.id} className="bg-surface p-5 rounded-xl border border-white/5 flex items-center justify-between active:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-lg bg-center bg-cover border border-white/10 bg-primary/20"></div>
                                                <div className="flex flex-col">
                                                    <p className="text-white text-[15px] font-semibold tracking-tight group-hover:text-primary transition-colors">{ticket.eventTitle}</p>
                                                    <p className="text-muted-grey text-xs mt-1">{ticket.eventDate}</p>
                                                    <p className="text-white/40 text-[10px] uppercase mt-1">{ticket.ticketName}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`w-2 h-2 rounded-full ${ticket.status === 'SCANNED' ? 'bg-red-500' : 'bg-primary'}`}></span>
                                                <span className="material-symbols-outlined text-white/20 text-xl group-hover:translate-x-1 transition-transform">chevron_right</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
