'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';

interface TicketType {
    name: string;
    price: number;
    quantity: number;
}

export default function CreateEventPage() {
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [venue, setVenue] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [tickets, setTickets] = useState<TicketType[]>([
        { name: 'General Access', price: 150, quantity: 100 }
    ]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
        }
    };

    const addTicketType = () => {
        setTickets([...tickets, { name: '', price: 0, quantity: 0 }]);
    };

    const updateTicket = (index: number, field: keyof TicketType, value: string | number) => {
        const newTickets = [...tickets];
        newTickets[index] = { ...newTickets[index], [field]: value };
        setTickets(newTickets);
    };

    const removeTicket = (index: number) => {
        if (tickets.length > 1) {
            const newTickets = tickets.filter((_, i) => i !== index);
            setTickets(newTickets);
        }
    };

    const handleSubmit = async () => {
        if (!user) return alert('You must be logged in to create an event');
        if (!videoFile) return alert('Please upload a video');

        setLoading(true);
        setUploadProgress(0);

        try {
            // 1. Get Mux Upload URL
            const uploadRes = await fetch('/api/mux/upload', { method: 'POST' });
            const { uploadUrl, uploadId } = await uploadRes.json();

            if (!uploadUrl) throw new Error("Failed to get upload URL");

            // 2. Upload to Mux using UpChunk
            await new Promise<void>((resolve, reject) => {
                const { createUpload } = require('@mux/upchunk'); // Dynamic import to avoid SSR issues if any
                const upload = createUpload({
                    endpoint: uploadUrl,
                    file: videoFile,
                    chunkSize: 5120, // 5MB chunks
                });

                upload.on('progress', (progress: any) => {
                    setUploadProgress(progress.detail);
                });

                upload.on('success', () => {
                    resolve();
                });

                upload.on('error', (err: any) => {
                    reject(err.detail);
                });
            });

            // 3. Poll for Asset Ready (playbackId)
            let playbackId = null;
            let attempts = 0;
            const maxAttempts = 30; // Wait up to 60s processing buffer

            while (!playbackId && attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 2000)); // Wait 2s
                const statusRes = await fetch(`/api/mux/upload/${uploadId}`);
                const statusData = await statusRes.json();

                if (statusData.playbackId) {
                    playbackId = statusData.playbackId;
                }
                attempts++;
            }

            if (!playbackId) {
                // Determine if we proceed without it (async processing) or fail
                // For now, let's assume if it takes too long, we might just save 'pending'
                // But typically for short 9:16 clips it's fast.
                console.warn("Timed out waiting for Mux playback ID, but upload successful.");
            }

            // 4. Create Event Document in Firestore
            const eventData = {
                title,
                description,
                venue,
                date,
                time,
                tickets,
                muxPlaybackId: playbackId, // Store the Mux ID
                videoUrl: null, // No longer using direct Firebase URL
                organizerId: user.uid,
                organizerName: user.displayName || 'Unknown Organizer',
                likes: 0,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'events'), eventData);

            // 5. Success
            setLoading(false);
            router.push('/');

        } catch (error: any) {
            console.error("Error creating event:", error);
            alert(`Error: ${error.message || "Upload failed"}`);
            setLoading(false);
        }
    };

    // Redirect if not logged in
    if (!user && !loading) {
        // We can show a loading state or redirect. For now, assuming AuthContext handles initial load.
    }

    return (
        <div className="bg-background-dark min-h-screen text-white font-display pb-32">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
                <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/50 border border-white/5 hover:bg-surface transition-colors">
                    <span className="material-symbols-outlined text-white text-[22px]">
                        {step === 1 ? 'close' : 'arrow_back'}
                    </span>
                </button>
                <h1 className="text-white text-lg font-semibold tracking-tight">Create Event</h1>
                <div className="w-10"></div> {/* Spacer */}
            </nav>

            <main className="px-6 py-6 max-w-md mx-auto">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-primary' : 'bg-white/10'}`}></div>
                    ))}
                </div>

                {/* STEP 1: VIDEO UPLOAD */}
                {step === 1 && (
                    <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in duration-300">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`aspect-[9/16] w-full rounded-2xl border-2 border-dashed ${videoPreview ? 'border-transparent' : 'border-white/20 hover:border-primary/50'} bg-surface/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group`}
                        >
                            {videoPreview ? (
                                <>
                                    <video src={videoPreview} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white text-4xl">edit</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Upload Teaser Video</h3>
                                    <p className="text-sm text-muted-grey text-center px-8 mt-2">
                                        Select a vertical (9:16) video that best represents your event vibe.
                                    </p>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                        </div>

                        <button
                            disabled={!videoPreview}
                            onClick={() => setStep(2)}
                            className="w-full bg-primary text-background-dark py-4 rounded-full font-bold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-all hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next: Event Details
                        </button>
                    </div>
                )}

                {/* STEP 2: EVENT DETAILS */}
                {step === 2 && (
                    <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in duration-300">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-grey uppercase tracking-wider ml-1">Event Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="E.g. Amapiano Sunsets"
                                    className="w-full bg-surface border border-white/5 focus:border-primary/50 rounded-xl p-4 text-white placeholder-white/20 focus:ring-0 transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-grey uppercase tracking-wider ml-1">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-surface border border-white/5 focus:border-primary/50 rounded-xl p-4 text-white placeholder-white/20 focus:ring-0 transition-all outline-none [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-grey uppercase tracking-wider ml-1">Time</label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-surface border border-white/5 focus:border-primary/50 rounded-xl p-4 text-white placeholder-white/20 focus:ring-0 transition-all outline-none [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-grey uppercase tracking-wider ml-1">Venue Name</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-grey material-symbols-outlined text-[20px]">location_on</span>
                                    <input
                                        value={venue}
                                        onChange={(e) => setVenue(e.target.value)}
                                        placeholder="E.g. The Blue Note"
                                        className="w-full bg-surface border border-white/5 focus:border-primary/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:ring-0 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-grey uppercase tracking-wider ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Tell us about the vibe..."
                                    className="w-full bg-surface border border-white/5 focus:border-primary/50 rounded-xl p-4 text-white placeholder-white/20 focus:ring-0 transition-all outline-none resize-none"
                                />
                            </div>
                        </div>

                        <button
                            disabled={!title || !date || !venue}
                            onClick={() => setStep(3)}
                            className="w-full bg-primary text-background-dark py-4 rounded-full font-bold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-all hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next: Tickets
                        </button>
                    </div>
                )}

                {/* STEP 3: TICKETS */}
                {step === 3 && (
                    <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in duration-300">
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3 items-start">
                            <span className="material-symbols-outlined text-primary shrink-0">info</span>
                            <p className="text-sm text-primary/90 leading-relaxed">
                                Moja Events charges a standard 5% platform fee on all ticket sales. Payouts are processed every Tuesday.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {tickets.map((ticket, index) => (
                                <div key={index} className="bg-surface border border-white/5 rounded-2xl p-4 space-y-4 relative group">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-white">Ticket Type #{index + 1}</h3>
                                        {tickets.length > 1 && (
                                            <button onClick={() => removeTicket(index)} className="text-red-400 hover:text-red-300 transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-grey uppercase tracking-wider ml-1">Name</label>
                                        <input
                                            value={ticket.name}
                                            onChange={(e) => updateTicket(index, 'name', e.target.value)}
                                            placeholder="E.g. VIP Access"
                                            className="w-full bg-background-dark/50 border border-white/5 focus:border-primary/50 rounded-xl p-3 text-white text-sm placeholder-white/20 focus:ring-0 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-grey uppercase tracking-wider ml-1">Price (R)</label>
                                            <input
                                                type="number"
                                                value={ticket.price === 0 ? '' : ticket.price}
                                                onChange={(e) => updateTicket(index, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                                placeholder="0"
                                                className="w-full bg-background-dark/50 border border-white/5 focus:border-primary/50 rounded-xl p-3 text-white text-sm placeholder-white/20 focus:ring-0 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-grey uppercase tracking-wider ml-1">Quantity</label>
                                            <input
                                                type="number"
                                                value={ticket.quantity === 0 ? '' : ticket.quantity}
                                                onChange={(e) => updateTicket(index, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                                placeholder="100"
                                                className="w-full bg-background-dark/50 border border-white/5 focus:border-primary/50 rounded-xl p-3 text-white text-sm placeholder-white/20 focus:ring-0 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addTicketType}
                                className="w-full py-3 border border-dashed border-white/20 rounded-xl text-sm font-medium text-muted-grey hover:text-white hover:border-primary/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add Another Ticket Type
                            </button>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-primary text-background-dark py-4 rounded-full font-bold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-all hover:shadow-primary/40 mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                                    <span className="text-sm font-medium text-background-dark">{Math.round(uploadProgress)}% Uploading...</span>
                                </div>
                            ) : (
                                'Publish Event'
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
