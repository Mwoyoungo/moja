import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";

interface FeedItemProps {
    id: string;
    title: string;
    subtitle: string;
    likes: string;
    image?: string;
    videoUrl?: string; // Legacy/Direct URL
    muxPlaybackId?: string; // New Mux ID
    isActive: boolean; // Control playback from parent
}

export default function FeedItem({ id, title, subtitle, likes, image, videoUrl, muxPlaybackId, isActive }: FeedItemProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const muxRef = useRef<any>(null); // Mux Player Ref
    const [isPlaying, setIsPlaying] = useState(false);

    // Sync video state with isActive prop
    useEffect(() => {
        const player = muxPlaybackId ? muxRef.current : videoRef.current;

        if (player) {
            if (isActive) {
                const playPromise = player.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        setIsPlaying(true);
                    }).catch((error: any) => {
                        console.log("Autoplay prevented:", error);
                        setIsPlaying(false);
                    });
                }
            } else {
                player.pause();
                if (!muxPlaybackId && player.currentTime) player.currentTime = 0; // Reset standard video
                setIsPlaying(false);
            }
        }
    }, [isActive, muxPlaybackId]);

    const togglePlay = () => {
        const player = muxPlaybackId ? muxRef.current : videoRef.current;
        if (!player) return;

        if (isPlaying) {
            player.pause();
            setIsPlaying(false);
        } else {
            player.play();
            setIsPlaying(true);
        }
    };

    return (
        <section className="relative h-full w-full snap-center shrink-0 overflow-hidden bg-black">
            {/* Video Layer: z-0 */}
            <div className="absolute inset-0 z-0 bg-black" onClick={togglePlay}>
                {muxPlaybackId ? (
                    <>
                        <MuxPlayer
                            ref={muxRef}
                            playbackId={muxPlaybackId}
                            streamType="on-demand"
                            loop
                            muted={false}
                            autoPlay={false} // Managed by intersection observer
                            controls={false} // Hidden controls for custom UI
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ ['--media-object-fit' as any]: 'cover' }}
                        />
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none z-10 w-full h-full">
                                <span className="material-symbols-outlined text-[72px] text-white/40 drop-shadow-lg animate-pulse">play_arrow</span>
                            </div>
                        )}
                    </>
                ) : videoUrl ? (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className="absolute inset-0 w-full h-full object-cover"
                            loop
                            muted={false}
                            playsInline
                        />
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none z-10 w-full h-full">
                                <span className="material-symbols-outlined text-[72px] text-white/40 drop-shadow-lg animate-pulse">play_arrow</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        className="absolute inset-0 bg-center bg-cover"
                        style={{ backgroundImage: `url("${image}")` }}
                    ></div>
                )}
            </div>

            {/* Bottom Overlay Gradient w/ Metadata: z-10 */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pb-20 pointer-events-none">
                <div className="flex flex-col gap-1.5 max-w-[90%] pointer-events-auto">
                    <Link href={`/events/${id}`}>
                        <h2 className="text-lg font-bold text-white leading-tight drop-shadow-md tracking-tight">
                            {title}
                        </h2>
                    </Link>

                    <div className="flex items-center gap-2 text-white/80">
                        <span className="text-xs font-medium drop-shadow-sm opacity-90">{subtitle}</span>
                    </div>

                    {/* Get Tickets Button: z-20 */}
                    <div className="mt-3 pointer-events-auto relative z-20 flex">
                        <Link href={`/events/${id}`}>
                            <button className="bg-primary hover:bg-white text-background-dark px-5 py-2 rounded-full font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-1.5">
                                <span>Get Tickets</span>
                                <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
