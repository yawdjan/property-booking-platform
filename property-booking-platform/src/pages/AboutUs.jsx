import React, { useEffect, useRef, useState } from 'react';

export default function AboutUs() {
    // Sections that fade in/out and a scroll-absorbing fullpage behavior (wheel & touch)
    const sectionsData = [
        {
            title: 'About Omarey',
            body:
                "Welcome to Omarey, where we are redefining the short-let property market by fostering powerful connections. We are more than just a booking portal, we are a dynamic ecosystem designed for two key players: discerning property owners and ambitious booking agents.",
            bg: 'from-amber-900 to-amber-800'
        },
        {
            title: 'Our Story',
            body:
            'Our platform was born from a simple observation: the process for agents to discover and book exceptional short-let properties was fragmented, and property owners struggled to gain consistent, high-quality exposure. We bridge this gap.',
            bg: 'from-blue-900 to-blue-800'
        },
        {
            title: 'Our Mission',
            body:
                "At Omarey, our mission is to empower success on both sides of the transaction through technology, trust, and a shared commitment to excellence. Join us in building the future of short-let rentals.",
            bg: 'from-amber-900 to-amber-800'
        },
        {
            title: 'Our Team',
            body:
                'A diverse group of product people, engineers, and hospitality pros who care about building practical software. We value clarity, performance, and great UX.',
                bg: 'from-blue-800 to-blue-900'
            },
            {
                title: 'Thank You',
                body:
                'Thanks for choosing Omarey. We are committed to continuously improving the platform and supporting your goals in property management.',
                bg: 'from-amber-800 to-amber-900'
        },
    ];

    // Full-page scrolling with debounce/throttle
    const scrollThrottleMs = 700;
    const [index, setIndex] = useState(0);
    const throttledRef = useRef(false);
    const touchStartRef = useRef(null);
    const containerRef = useRef(null);

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
        e.stopPropagation();

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
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`relative h-screen w-full overflow-hidden bg-amber-950 ${index === 0 || index === 3 ? '' : 'touch-none'}`}>
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
                            className={`h-screen w-full flex items-center justify-center px-8 bg-gradient-to-br ${s.bg}`}
                            aria-hidden={!active}
                        >
                            <div
                                className={`max-w-3xl text-center transform transition-all duration-700 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                    }`}
                            >
                                <h1 className="text-5xl font-bold mb-6 text-amber-100 drop-shadow-lg">{s.title}</h1>
                                <p className="text-xl text-amber-50 leading-relaxed">{s.body}</p>
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* small indicator */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-5">
                {sectionsData.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-3 h-10 rounded-full transition-all duration-300 ${i === index ? 'bg-blue-400 scale-110 shadow-lg' : 'bg-amber-200/50 hover:bg-amber-200'
                            }`}
                        aria-label={`Go to section ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}