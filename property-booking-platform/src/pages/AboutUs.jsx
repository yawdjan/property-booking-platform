import React, { useEffect, useRef, useState } from 'react';

export default function AboutUs() {
    // Sections that fade in/out and a scroll-absorbing fullpage behavior (wheel & touch)
    const sectionsData = [
        {
            title: 'Our Mission',
            body:
                "At PropBooking we simplify property booking for managers, agents, and renters. We build intuitive tools that reduce friction and save time so you can focus on what matters.",
        },
        {
            title: 'Our Story',
            body:
                'Founded in 2023, PropBooking started as a small team with a big idea: make property booking pleasant and reliable. We iterate quickly and listen closely to our users.',
        },
        {
            title: 'Our Team',
            body:
                'A diverse group of product people, engineers, and hospitality pros who care about building practical software. We value clarity, performance, and great UX.',
        },
        {
            title: 'Thank You',
            body:
                'Thanks for choosing PropBooking. We’re committed to continuously improving the platform and supporting your goals in property management.',
        },
    ];

    // Full-page scrolling with debounce/throttle
    const scrollThrottleMs = 700;
    const [index, setIndex] = useState(0);
    const throttledRef = useRef(false);
    const touchStartRef = useRef(null);
    const containerRef = useRef(null);

    // NOTE: removed body overflow: hidden so parent can scroll when at boundaries

    // Wheel handler for desktop
    function onWheel(e) {
        const isFirst = index === 0;
        const isLast = index === sectionsData.length - 1;

        // If in the FIRST section and scrolling UP → allow parent scroll
        if (isFirst && e.deltaY < 0) return;

        // If in the LAST section and scrolling DOWN → allow parent scroll
        if (isLast && e.deltaY > 0) return;

        // Otherwise, trap scroll inside AboutUs
        e.preventDefault();
        e.stopPropagation();

        if (throttledRef.current) return;

        throttledRef.current = true;

        if (e.deltaY > 0) {
            setIndex((i) => Math.min(i + 1, sectionsData.length - 1));
        } else {
            setIndex((i) => Math.max(i - 1, 0));
        }

        setTimeout(() => {
            throttledRef.current = false;
        }, scrollThrottleMs);
    }

    // Touch handlers for mobile swipe
    function onTouchMove(e) {
        if (touchStartRef.current == null || throttledRef.current) return;

        const currentY = e.touches[0].clientY;
        const diff = touchStartRef.current - currentY;

        const isFirst = index === 0;
        const isLast = index === sectionsData.length - 1;

        // FIRST section: downward swipe → allow parent scroll
        if (isFirst && diff < 0) return;

        // LAST section: upward swipe → allow parent scroll
        if (isLast && diff > 0) return;

        e.preventDefault();
        e.stopPropagation();   // ← FIX tiny bounce on mobile

        if (Math.abs(diff) < 25) return;

        throttledRef.current = true;

        if (diff > 0) {
            setIndex((i) => Math.min(i + 1, sectionsData.length - 1));
        } else {
            setIndex((i) => Math.max(i - 1, 0));
        }

        touchStartRef.current = currentY;

        setTimeout(() => {
            throttledRef.current = false;
        }, scrollThrottleMs);
    }


    function onTouchStart(e) {
        touchStartRef.current = e.touches[0].clientY;
    }

    function onTouchEnd() {
        touchStartRef.current = null;
    }

    // Keyboard navigation
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                setIndex((i) => Math.min(i + 1, sectionsData.length - 1));
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                setIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Home') {
                setIndex(0);
            } else if (e.key === 'End') {
                setIndex(sectionsData.length - 1);
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={containerRef}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}   // ← YOU MISSED THIS
            onTouchEnd={onTouchEnd}
            className={`relative h-screen w-full overflow-hidden bg-gray-50 ${index === 0 || index === 3 ? '' : 'touch-none'}`}>
            <div
                // move the sections with transform for smooth full-page transitions
                style={{
                    transform: `translateY(-${index * 100}vh)`,
                    transition: 'transform 700ms cubic-bezier(.2,.9,.2,1)',
                    height: `${sectionsData.length * 100}vh`,
                }}
                className="w-full"
            >
                {sectionsData.map((s, i) => {
                    const active = i === index;
                    return (
                        <section
                            key={s.title}
                            className="h-screen w-full flex items-center justify-center px-8"
                            aria-hidden={!active}
                        >
                            <div
                                className={`max-w-3xl text-center transform transition-all duration-700 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                    }`}
                            >
                                <h1 className="text-4xl font-bold mb-6 text-blue-600">{s.title}</h1>
                                <p className="text-lg text-gray-700">{s.body}</p>
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* small indicator */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
                {sectionsData.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-2 h-8 rounded-full transition-colors ${i === index ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                        aria-label={`Go to section ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}