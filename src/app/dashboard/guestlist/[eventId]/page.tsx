'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface GuestKey {
    id: string;
    ticketId: string;
    userId: string;
    status: 'VALID' | 'SCANNED' | 'USED';
    purchaseDate: any;
    price: number;
    userName?: string;
    userEmail?: string;
}

interface EventDetails {
    title: string;
    date: string;
    time: string;
    venue: string;
}

export default function GuestlistPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
    const [guests, setGuests] = useState<GuestKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchGuestData = async () => {
            if (!eventId) return;

            try {
                // 1. Fetch Event Details
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    setEventDetails(eventSnap.data() as EventDetails);
                }

                // 2. Fetch Tickets for this Event
                const q = query(collection(db, 'tickets'), where('eventId', '==', eventId));
                const querySnapshot = await getDocs(q);

                const tickets: any[] = [];
                const userIds = new Set<string>();

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    tickets.push({
                        id: doc.id,
                        ticketId: doc.id,
                        ...data
                    });
                    if (data.userId) userIds.add(data.userId);
                });

                // 3. Fetch User Details for these tickets
                // Note: In a real app with thousands of users, we'd paginate or cloud function this.
                // For MVP, client-side fetching is acceptable.
                const userMap: Record<string, any> = {};

                // Firestore 'in' limit is 10. We'll fetch individually or batch if small.
                // For simplicity/reliability in this context, let's fetch individual profiles roughly 
                // or assume we can get them.
                // A better approach for the list is to just fetch the users needed.

                if (userIds.size > 0) {
                    // We will fetch users one by one to avoid array-contains limits for now, 
                    // or ideally we update tickets to store snapshot of userName.
                    // Let's try to fetch user profiles.
                    const userPromises = Array.from(userIds).map(uid => getDoc(doc(db, 'users', uid)));
                    const userSnaps = await Promise.all(userPromises);

                    userSnaps.forEach(snap => {
                        if (snap.exists()) {
                            userMap[snap.id] = snap.data();
                        }
                    });
                }

                // Merge Data
                const guestList = tickets.map(ticket => ({
                    ...ticket,
                    userName: userMap[ticket.userId]?.displayName || 'Unknown Guest',
                    userEmail: userMap[ticket.userId]?.email || 'No Email'
                }));

                setGuests(guestList);

            } catch (error) {
                console.error("Error fetching guestlist:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGuestData();
    }, [eventId]);

    const filteredGuests = guests.filter(guest =>
        guest.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: guests.length,
        scanned: guests.filter(g => g.status === 'SCANNED').length,
        revenue: guests.reduce((acc, curr) => acc + (curr.price || 0), 0)
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-white font-display pb-10">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background-dark/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">Guest List</h1>
                        <p className="text-xs text-white/60">{eventDetails?.title}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-6">

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-surface p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-muted-grey uppercase font-bold">Total</p>
                        <p className="text-2xl font-bold mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-muted-grey uppercase font-bold">Scanned</p>
                        <p className="text-2xl font-bold mt-1 text-green-400">{stats.scanned}</p>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-muted-grey uppercase font-bold">Revenue</p>
                        <p className="text-2xl font-bold mt-1 text-primary">R {stats.revenue}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40">search</span>
                    <input
                        type="text"
                        placeholder="Search by name or ticket ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                    />
                </div>

                {/* Guest List */}
                <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
                    {filteredGuests.length === 0 ? (
                        <div className="p-8 text-center text-white/40">
                            <p>No guests found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredGuests.map((guest) => (
                                <div key={guest.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${guest.status === 'SCANNED' ? 'bg-green-500/20 text-green-500' : 'bg-white/10'
                                            }`}>
                                            {guest.userName?.charAt(0) || 'G'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{guest.userName}</p>
                                            <p className="text-xs text-white/40">ID: {guest.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${guest.status === 'SCANNED'
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                : 'bg-primary/10 text-primary border border-primary/20'
                                            }`}>
                                            {guest.status || 'VALID'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
