import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function AboutUs() {
    const sectionsData = [
        {
            title: 'About Omarey',
            subtitle: 'Welcome to the Future',
            body: "Welcome to Omarey, where we are redefining the short-let property market by fostering powerful connections. We are more than just a booking portal, we are a dynamic ecosystem designed for two key players: discerning property owners and ambitious booking agents.",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
            imageAlt: "Modern office workspace"
        },
        {
            title: 'Our Story',
            subtitle: 'How It All Began',
            body: 'Our platform was born from a simple observation. The process for agents to discover and book exceptional short-let properties was fragmented, and property owners struggled to gain consistent, high-quality exposure. We bridge this gap through innovation and dedication.',
            image: "https://images.ctfassets.net/x715brg11yrw/6rBmPGxiR7omj2YN8C1YbD/bb1b52cbfae6d3079e02ad62765c93ce/Modern_living_room_with_clean_lines_and_grey_sofa_set.jpg?w=1440&fm=webp&q=80",
            imageAlt: "Team collaboration"
        },
        {
            title: 'Our Mission',
            subtitle: 'Empowering Success',
            body: "At Omarey, our mission is to empower success on both sides of the transaction through technology, trust, and a shared commitment to excellence. Join us in building the future of short-let rentals.",
            image: "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsb2ZmaWNlMTJfcGhvdG9fb2ZfYV9iZWRyb29tX2lzX2luX3RoZV9hdXR1bW5fbWluaW1hbGlzdF9mN2Q4NTc1MC1iYjAzLTRkMDUtYjYwYy1hNzlmZTA5MzExOWJfMS5qcGc.jpg",
            imageAlt: "Strategic planning"
        },
        {
            title: 'Our Team',
            subtitle: 'The People Behind Omarey',
            body: 'A diverse group of product people, engineers, and hospitality professionals who care about building practical software. We value clarity, performance, and great user experience in everything we create.',
            image: "https://img.freepik.com/free-photo/colleagues-team-working-company-paperwork-doig-teamwork-analyze-documents-online-research-information-planning-corporate-presentation-with-data-charts-job-collaboration_482257-49375.jpg?t=st=1769513382~exp=1769516982~hmac=37109112bc7a5768709db4dddebf48ae0beba2f78b71551426d6d55442a4352e&w=2000",
            imageAlt: "Team meeting"
        },
        {
            title: 'Thank You',
            subtitle: 'Join Our Journey',
            body: 'Thanks for choosing Omarey. We are committed to continuously improving the platform and supporting your goals in property management. Together, we\'re building something special.',
            image: "https://img.freepik.com/premium-photo/team-young-african-people-office-table-with-laptops_219728-4522.jpg",
            imageAlt: "Success celebration"
        },
    ];

    const scrollThrottleMs = 700;
    const [index, setIndex] = useState(0);
    const throttledRef = useRef(false);
    const touchStartRef = useRef(null);
    const containerRef = useRef(null);

    // Wheel handler for desktop
    function onWheel(e) {
        const isFirst = index === 0;
        const isLast = index === sectionsData.length - 1;

        // Allow parent scroll at boundaries
        if (isFirst && e.deltaY < 0) return;
        if (isLast && e.deltaY > 0) return;

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

        if (isFirst && diff < 0) return;
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
    }, [sectionsData.length]);

    return (
        <div
            ref={containerRef}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`relative h-screen w-full overflow-hidden bg-amber-950`}
        >
            {/* Sections Container */}
            <div
                style={{
                    transform: `translateY(-${index * 100}vh)`,
                    transition: 'transform 700ms cubic-bezier(.2,.9,.2,1)',
                    height: `${sectionsData.length * 100}vh`,
                }}
                className="w-full"
            >
                {sectionsData.map((s, i) => {
                    const active = i === index;
                    const isEven = i % 2 === 0;
                    
                    // Alternate between two gradient schemes
                    const bgGradient = isEven 
                        ? 'from-primary-600 via-accent-600 to-secondary-600'
                        : 'from-secondary-500 via-primary-400 to-accent-600';

                    return (
                        <section
                            key={s.title}
                            className={`h-screen w-full flex items-center justify-center px-4 md:px-8 bg-gradient-to-br ${bgGradient} relative overflow-hidden`}
                            aria-hidden={!active}
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                            </div>

                            {/* Content Container */}
                            <div className="max-w-7xl w-full mx-auto relative z-10">
                                <div
                                    className={`grid md:grid-cols-2 gap-8 lg:gap-12 items-center transform transition-all duration-700 ${
                                        active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                                    }`}
                                >
                                    {/* Image - Desktop: alternates left/right, Mobile: alternates top/bottom */}
                                    <div
                                        className={`
                                            ${isEven ? 'md:order-1' : 'md:order-2'}
                                            ${isEven ? 'order-1' : 'order-2'}
                                        `}
                                    >
                                        <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                                            <img
                                                src={s.image}
                                                alt={s.imageAlt}
                                                className="w-full h-64 md:h-96 object-cover hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Text Content - Desktop: alternates right/left, Mobile: alternates top/bottom (opposite of image) */}
                                    <div
                                        className={`
                                            ${isEven ? 'md:order-2' : 'md:order-1'}
                                            ${isEven ? 'order-2' : 'order-1'}
                                            text-center md:text-left
                                        `}
                                    >
                                        {/* Subtitle */}
                                        <p className="text-amber-700 font-bold mb-3 uppercase tracking-wide text-2xl md:text-base">
                                            {s.subtitle}
                                        </p>

                                        {/* Title */}
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
                                            {s.title}
                                        </h1>

                                        {/* Body */}
                                        <p className="text-lg md:text-xl lg:text-2xl text-amber-900 leading-relaxed drop-shadow-lg">
                                            {s.body}
                                        </p>

                                        {/* Scroll Indicator (only on first section) */}
                                        {i === 0 && (
                                            <div className="mt-8 flex justify-center md:justify-start">
                                                <div className="animate-bounce w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <ChevronDown className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Navigation Dots */}
            <div className="fixed right-6 md:right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
                {sectionsData.map((section, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`group relative transition-all duration-300 ${
                            i === index ? 'w-3 h-12' : 'w-3 h-3'
                        }`}
                        aria-label={`Go to ${section.title}`}
                    >
                        <div
                            className={`w-full h-full rounded-full transition-all duration-300 ${
                                i === index
                                    ? 'bg-white shadow-lg shadow-white/50'
                                    : 'bg-white/40 hover:bg-white/60'
                            }`}
                        />
                        
                        {/* Tooltip */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-white text-amber-950 px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap shadow-lg">
                                {section.title}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Keyboard Hint */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:block">
                <div className="bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-white/20">
                    <span>Use ↑ ↓ arrow keys to navigate</span>
                </div>
            </div>
        </div>
    );
}