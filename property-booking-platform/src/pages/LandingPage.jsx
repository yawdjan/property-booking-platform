import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import HomePage from './HomePage';
import AboutUs from './AboutUs';
import PropertyListings from './ListingsPage';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setCurrentView } = useApp();

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'Agents', label: 'Agents' },
    { id: 'listings', label: 'Listings' },
    { id: 'services', label: 'Services' },
    { id: 'aboutus', label: 'About Us' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (activeTab !== 'home') {
      // animate hero container to move from -mt-20 to mt-10 and get a rounder rectangle shape
      const heroHeading = document.querySelector('h1');
      if (heroHeading) {
        // find the nearest parent that matches the hero container
        const hero = Array.from(document.querySelectorAll('div')).find(d =>
          d.contains(heroHeading) && d.classList && d.classList.contains('relative') && d.classList.contains('text-center')
        );

        if (hero) {
          // set up smooth transition for margin and border-radius
          hero.style.transition = 'margin-top 600ms cubic-bezier(.2,.9,.2,1), border-radius 600ms cubic-bezier(.2,.9,.2,1)';
          // ensure current computed margin-top is applied inline so transition starts from the visible value
          const comp = getComputedStyle(hero);
          hero.style.marginTop = comp.marginTop;

          // perform the animated change on the next frame
          requestAnimationFrame(() => {
            // Tailwind mt-10 => 2.5rem
            hero.style.marginTop = '2.5rem';
            hero.style.marginBottom = '2.5rem';
            hero.style.marginRight = '1.5rem';
            hero.style.marginLeft = '1.5rem';
            // a more rounded rectangle; tweak as desired
            hero.style.borderRadius = '1.25rem';
            // if you want to limit the hero height so rounding is visible, you can also change height/maxHeight:
            // hero.style.maxHeight = '80vh';
            // hero.style.overflow = 'hidden';
          });
        }
      }
    } else {
      // animate back to original values (-mt-20, mb-16, no rounding)
      const heroHeading = document.querySelector('h1');
      if (heroHeading) {
        const hero = Array.from(document.querySelectorAll('div')).find(d =>
          d.contains(heroHeading) && d.classList && d.classList.contains('relative') && d.classList.contains('text-center')
        );

        if (hero) {
          // include all margin sides + border-radius in the transition so the revert animates smoothly
          hero.style.transition = 'margin-top 600ms cubic-bezier(.2,.9,.2,1), margin-bottom 600ms cubic-bezier(.2,.9,.2,1), margin-left 600ms cubic-bezier(.2,.9,.2,1), margin-right 600ms cubic-bezier(.2,.9,.2,1), border-radius 600ms cubic-bezier(.2,.9,.2,1)';

          // ensure current computed values are applied inline so transition starts from the visible value
          const comp = getComputedStyle(hero);
          hero.style.marginTop = comp.marginTop;
          hero.style.marginBottom = comp.marginBottom;
          hero.style.marginLeft = comp.marginLeft;
          hero.style.marginRight = comp.marginRight;
          hero.style.borderRadius = comp.borderRadius;

          // animate back to the original Tailwind values
          requestAnimationFrame(() => {
            // -mt-20 => -5rem, mb-16 => 4rem
            hero.style.marginTop = '-5rem';
            hero.style.marginBottom = '4rem';
            hero.style.marginLeft = '0';
            hero.style.marginRight = '0';
            hero.style.borderRadius = '0';
          });
        }
      }
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Desktop & Mobile Header */}
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-white drop-shadow-lg">PropBooking</div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4 items-center">
              {links.map(link => (
                <button
                  key={link.id}
                  className="text-white px-4 py-2 hover:text-blue-400 transition-colors drop-shadow"
                  onClick={() => setActiveTab(link.id)}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => setCurrentView('login')}
                className="px-4 py-2 text-white hover:text-blue-400 transition-colors drop-shadow"
              >
                Login
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="px-10 py-4 bg-cyan-600/20 backdrop-blur text-white rounded-full hover:bg-cyan-600/30 transition-all border border-white/30"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2">
              {links.map(link => (
                <button
                  key={link.id}
                  className="block w-full text-left text-white px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setCurrentView('login');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setCurrentView('register');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-center bg-cyan-600/20 backdrop-blur text-white px-4 py-3 rounded-lg hover:bg-cyan-600/30 transition-all border border-white/30 mt-2"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="relative text-center -mt-20 mb-16 h-screen overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop)',
          }}
        />

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        {/* Content */}
        <div className="relative z-4 px-4">
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Streamline Your Property Bookings
          </h1>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            Book properties for your clients and earn commissions effortlessly
          </p>
        </div>
      </div>
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'aboutus' && <AboutUs />}
      {activeTab === 'listings' && <PropertyListings />}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 static bottom-0 w-full">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">

        {/* Company */}
        <div>
          <h3 className="text-white text-xl font-semibold mb-4">PropertyBook</h3>
          <p className="text-gray-400 leading-relaxed">
            All-in-one platform to manage bookings, payments, clients, and
            properties with ease.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-3">
            <li><a href="#" className="hover:text-white">Dashboard</a></li>
            <li><a href="#" className="hover:text-white">Bookings</a></li>
            <li><a href="#" className="hover:text-white">Analytics</a></li>
            <li><a href="#" className="hover:text-white">Payments</a></li>
          </ul>
        </div>

        {/* Property Tools */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Property Tools</h4>
          <ul className="space-y-3">
            <li><a href="#" className="hover:text-white">List a Property</a></li>
            <li><a href="#" className="hover:text-white">Tenant Screening</a></li>
            <li><a href="#" className="hover:text-white">Maintenance</a></li>
            <li><a href="#" className="hover:text-white">Owner Portal</a></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Accra, Ghana</li>
            <li>support@propertybook.com</li>
            <li>+233 55 000 0000</li>
          </ul>

          <div className="flex gap-4 mt-6">
            <a href="#" className="hover:text-white text-xl">🌐</a>
            <a href="#" className="hover:text-white text-xl">📘</a>
            <a href="#" className="hover:text-white text-xl">🐦</a>
            <a href="#" className="hover:text-white text-xl">📸</a>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t border-gray-700 mt-16 pt-8 text-center text-gray-500">
        <p>© {new Date().getFullYear()} PropertyBook. All rights reserved.</p>
      </div>
    </footer>
  );
};