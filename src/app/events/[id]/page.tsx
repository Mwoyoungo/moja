'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface TicketType {
    name: string;
    price: number;
    quantity: number;
}

interface EventData {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    tickets: TicketType[];
    videoUrl: string;
}

export default function EventDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const id = params?.id as string;

    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);

    // Purchase State
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [cart, setCart] = useState<{ [key: number]: number }>({});
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchEvent = async () => {
            try {
                const docRef = doc(db, 'events', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() } as EventData);
                } else {
                    console.error("No such event!");
                }
            } catch (error) {
                console.error("Error getting event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleQuantityChange = (index: number, change: number) => {
        setCart(prev => {
            const currentQty = prev[index] || 0;
            const newQty = Math.max(0, currentQty + change);
            return { ...prev, [index]: newQty };
        });
    };

    const getTotalPrice = () => {
        if (!event) return 0;
        return event.tickets.reduce((total, ticket, index) => {
            return total + (ticket.price * (cart[index] || 0));
        }, 0);
    };

    const handleCheckout = async () => {
        if (!user) return router.push('/auth/login');
        if (!event) return;

        const totalTickets = Object.values(cart).reduce((a, b) => a + b, 0);
        if (totalTickets === 0) return alert("Please select at least one ticket.");

        setPurchasing(true);

        try {
            // Mock Payment simply creates the tickets immediately
            const batchPromises = [];

            // For each ticket type in cart
            for (const [indexStr, qty] of Object.entries(cart)) {
                const index = parseInt(indexStr);
                const ticketType = event.tickets[index];

                // Create 'qty' number of tickets
                for (let i = 0; i < qty; i++) {
                    const ticketData = {
                        userId: user.uid,
                        eventId: event.id,
                        eventTitle: event.title,
                        eventDate: event.date,
                        eventVenue: event.venue,
                        eventImage: event.videoUrl, // Using video/hero for now
                        ticketName: ticketType.name,
                        price: ticketType.price,
                        status: 'UNSCANNED', // Initial valid state
                        purchaseDate: serverTimestamp(),
                        qrCodeHash: Math.random().toString(36).substring(7), // Simple static hash for MVP
                    };
                    batchPromises.push(addDoc(collection(db, 'tickets'), ticketData));
                }
            }

            await Promise.all(batchPromises);

            // Success redirect
            router.push('/tickets');

        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Checkout failed. Please try again.");
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">
                <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">
                <p>Event not found</p>
                <button onClick={() => router.back()} className="ml-4 text-primary font-bold">Go Back</button>
            </div>
        );
    }

    const minPrice = event.tickets.length > 0
        ? Math.min(...event.tickets.map(t => t.price))
        : 0;

    return (
        <div className="bg-background-dark min-h-screen text-white font-display">
            <div className="relative mx-auto max-w-md min-h-screen pb-32">
                {/* Top Navigation */}
                <div className="fixed top-0 z-50 flex w-full max-w-md items-center justify-between px-6 py-4 backdrop-blur-md pointer-events-none">
                    <button
                        onClick={() => router.back()}
                        className="flex w-10 h-10 items-center justify-center rounded-full bg-background-dark/20 text-white pointer-events-auto hover:bg-background-dark/40 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                    </button>
                    <div className="flex gap-2 pointer-events-auto">
                        <button className="flex w-10 h-10 items-center justify-center rounded-full bg-background-dark/20 text-white hover:bg-background-dark/40 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                        </button>
                        <button className="flex w-10 h-10 items-center justify-center rounded-full bg-background-dark/20 text-white hover:bg-background-dark/40 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">ios_share</span>
                        </button>
                    </div>
                </div>

                {/* Hero Image Section - Use Video as Hero if available or fallback */}
                <div className="relative h-[440px] w-full bg-black">
                    {event.videoUrl ? (
                        <video
                            src={event.videoUrl}
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                            muted
                            loop
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <div className="absolute inset-0 bg-primary/20"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/20 to-background-dark"></div>
                </div>

                {/* Event Title */}
                <div className="relative -mt-20 px-6">
                    <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                        Featured Event
                    </div>
                    <h1 className="mt-4 text-[40px] font-bold leading-[1.1] tracking-tight text-white">
                        {event.title}
                    </h1>
                </div>

                {/* Quick Info Module */}
                <div className="mt-8 px-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-surface p-4 border border-white/5">
                            <span className="material-symbols-outlined text-primary mb-2">calendar_today</span>
                            <p className="text-xs text-muted-grey">Date</p>
                            <p className="text-sm font-medium text-white">{event.date}</p>
                        </div>
                        <div className="rounded-xl bg-surface p-4 border border-white/5">
                            <span className="material-symbols-outlined text-primary mb-2">schedule</span>
                            <p className="text-xs text-muted-grey">Time</p>
                            <p className="text-sm font-medium text-white">{event.time}</p>
                        </div>
                    </div>
                </div>

                {/* Details List */}
                <div className="mt-10 px-6">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-lg bg-surface text-white">
                                <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">{event.venue}</h4>
                                <p className="text-sm leading-relaxed text-muted-grey">Tap to view map</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-lg bg-surface text-white">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">From R{minPrice}</h4>
                                <p className="text-sm leading-relaxed text-muted-grey">{event.tickets.length} ticket types available</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="mt-12 px-6">
                    <h3 className="text-lg font-bold text-white mb-4">About the Experience</h3>
                    <p className="text-base leading-[1.7] text-muted-grey whitespace-pre-wrap">
                        {event.description}
                    </p>
                </div>

                {/* Fixed Bottom CTA */}
                <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md p-6 pt-2">
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent -z-10"></div>
                    <button
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-lg font-bold text-background-dark transition-transform active:scale-[0.98] shadow-lg shadow-primary/20"
                    >
                        <span>Get Tickets</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                    {/* Safe area padding for iOS */}
                    <div className="h-4"></div>
                </div>

                {/* Purchase Modal / Bottom Sheet */}
                {isPurchaseModalOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setIsPurchaseModalOpen(false)}
                        ></div>

                        {/* Sheet */}
                        <div className="fixed bottom-0 left-0 right-0 z-[70] bg-[#1A1A1F] rounded-t-[32px] overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
                            {/* Drag Handle */}
                            <div className="w-full h-8 flex items-center justify-center shrink-0">
                                <div className="w-12 h-1 bg-white/20 rounded-full"></div>
                            </div>

                            {/* Header */}
                            <div className="px-6 pb-6 border-b border-white/5">
                                <h2 className="text-xl font-bold text-white">Select Tickets</h2>
                                <p className="text-sm text-muted-grey mt-1">{event.date} • {event.time}</p>
                            </div>

                            {/* Ticket List */}
                            <div className="p-6 overflow-y-auto space-y-4">
                                {event.tickets.map((ticket, index) => (
                                    <div key={index} className="flex items-center justify-between bg-surface border border-white/5 rounded-2xl p-4">
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{ticket.name}</h3>
                                            <p className="text-primary font-bold">R{ticket.price}</p>
                                        </div>

                                        <div className="flex items-center gap-4 bg-background-dark rounded-xl p-1 border border-white/5">
                                            <button
                                                onClick={() => handleQuantityChange(index, -1)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${!cart[index] ? 'text-white/20' : 'text-white hover:bg-white/10'}`}
                                                disabled={!cart[index]}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">remove</span>
                                            </button>
                                            <span className="w-4 text-center font-bold text-white">{cart[index] || 0}</span>
                                            <button
                                                onClick={() => handleQuantityChange(index, 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Checkout */}
                            <div className="p-6 bg-surface border-t border-white/5 mt-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-muted-grey text-sm font-medium">Total</span>
                                    <span className="text-2xl font-bold text-white">R{getTotalPrice().toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={purchasing || getTotalPrice() === 0}
                                    className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {purchasing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Checkout</span>
                                            <span className="material-symbols-outlined">lock</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
