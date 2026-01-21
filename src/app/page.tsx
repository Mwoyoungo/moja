'use client';
import FeedItem from '@/components/FeedItem';
import BottomNav from '@/components/BottomNav';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  likes: number;
  videoUrl?: string; // Made optional
  muxPlaybackId?: string; // Added Mux ID
}

import SplashScreen from '@/components/SplashScreen';

export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as EventData[];
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Intersection Observer to detect active slide
  useEffect(() => {
    const container = document.getElementById('feed-container');
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Get the index from data-index attribute
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0.6 // Trigger when 60% of element is visible
      }
    );

    const sections = document.querySelectorAll('.feed-item');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [events]); // Re-run when events load

  return (
    <main className="fixed inset-0 h-full w-full bg-black overflow-hidden">
      <SplashScreen />

      {/* Scroll Container 
          - snap-start on children + snap-mandatory on parent
          - h-full combined with fixed inset-0 on parent ensures it fills exactly the window
      */}
      <div
        id="feed-container"
        className="absolute inset-0 h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar overscroll-none"
      >
        {events.length === 0 ? (
          // Empty State / Loading
          <div className="h-full w-full flex flex-col items-center justify-center text-white/50">
            <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-sm">Loading events...</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div key={event.id} data-index={index} className="feed-item h-full w-full snap-center shrink-0 relative">
              <FeedItem
                id={event.id}
                title={event.title}
                subtitle={`${event.date} • ${event.venue}`}
                likes={event.likes ? event.likes.toString() : '0'}
                videoUrl={event.videoUrl}
                muxPlaybackId={event.muxPlaybackId}
                isActive={index === activeIndex}
              />
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
