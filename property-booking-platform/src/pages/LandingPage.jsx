/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import HomePage from './HomePage';
import AboutUs from './AboutUs';
import PropertyListings from './ListingsPage';
import Services from './Services';
import { useNavigate } from 'react-router-dom';

export default function LandingPage({ defaultTab = 'home' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'listings', label: 'Listings' },
    { id: 'services', label: 'Services' },
    { id: 'aboutus', label: 'About Us' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (activeTab !== 'home') {
      const heroHeading = document.querySelector('h1');
      if (heroHeading) {
        const hero = Array.from(document.querySelectorAll('div')).find(d =>
          d.contains(heroHeading) && d.classList && d.classList.contains('relative') && d.classList.contains('text-center')
        );

        if (hero) {
          hero.style.transition = 'margin-top 600ms cubic-bezier(.2,.9,.2,1), border-radius 600ms cubic-bezier(.2,.9,.2,1)';
          const comp = getComputedStyle(hero);
          hero.style.marginTop = comp.marginTop;

          requestAnimationFrame(() => {
            hero.style.marginTop = '2.5rem';
            hero.style.marginBottom = '2.5rem';
            hero.style.marginRight = '1.5rem';
            hero.style.marginLeft = '1.5rem';
            hero.style.borderRadius = '1.25rem';
          });
        }
      }
    } else {
      const heroHeading = document.querySelector('h1');
      if (heroHeading) {
        const hero = Array.from(document.querySelectorAll('div')).find(d =>
          d.contains(heroHeading) && d.classList && d.classList.contains('relative') && d.classList.contains('text-center')
        );

        if (hero) {
          hero.style.transition = 'margin-top 600ms cubic-bezier(.2,.9,.2,1), margin-bottom 600ms cubic-bezier(.2,.9,.2,1), margin-left 600ms cubic-bezier(.2,.9,.2,1), margin-right 600ms cubic-bezier(.2,.9,.2,1), border-radius 600ms cubic-bezier(.2,.9,.2,1)';

          const comp = getComputedStyle(hero);
          hero.style.marginTop = comp.marginTop;
          hero.style.marginBottom = comp.marginBottom;
          hero.style.marginLeft = comp.marginLeft;
          hero.style.marginRight = comp.marginRight;
          hero.style.borderRadius = comp.borderRadius;

          requestAnimationFrame(() => {
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

  // Handle navigation with URL updates
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      navigate('/');
    } else {
      navigate(`/${tabId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 via-secondary-100 to-secondary-200">
      <nav className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-primary-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1" onClick={() => handleTabChange('home')} style={{ cursor: 'pointer' }}>
              <img src="/logo.png" alt="Omarey Logo" className="h-10 w-24" />
              {/* <div className="text-2xl font-bold bg-gradient-to-r from-primary-700 via-accent-600 to-secondary-600 bg-clip-text text-transparent">
                Omarey
              </div> */}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4 items-center">
              {links.map(link => (
                <button
                  key={link.id}
                  className="text-primary-800 px-4 py-2 hover:text-primary-600 transition-colors drop-shadow font-medium"
                  onClick={() => handleTabChange(link.id)}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-primary-800 hover:text-secondary-500 transition-colors drop-shadow font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-full hover:from-secondary-600 hover:to-accent-600 transition-all shadow-lg hover:shadow-xl font-semibold"
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
                    handleTabChange(link.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
                className="px-8 py-4 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-full hover:from-secondary-600 hover:to-accent-600 transition-all shadow-lg hover:shadow-xl font-semibold">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="relative text-center -mt-20 mb-16 h-screen overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        {links.map(link => (
          <div
            key={link.id}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{
              opacity: activeTab === link.id ? 1 : 0,
              pointerEvents: activeTab === link.id ? 'auto' : 'none',
              backgroundImage:
                link.id === 'home' ? 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop)' :
                  link.id === 'listings' ? 'url(https://images.unsplash.com/photo-1591077174597-1aac52bae9e4?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' :
                    link.id === 'services' ? 'url(https://images.unsplash.com/photo-1590291127093-24b2232c51ec?q=80&w=757&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' :
                      'url(https://images.unsplash.com/photo-1762245833000-e68bc8efba60?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
              filter: link.id === 'home' ? 'none' : 'blur(4px)',
            }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        <div className="relative z-4 px-4">
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            {activeTab === 'home' && 'Streamline Your Property Bookings'}
            {activeTab === 'services' && 'Our Services'}
            {activeTab === 'listings' && 'Explore Our Property Listings'}
            {activeTab === 'aboutus' && 'About Us'}
          </h1>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            {activeTab === 'home' && 'Book properties for your clients and earn commissions effortlessly'}
            {activeTab === 'services' && 'Empowering property owners and booking agents through technology, trust, and excellence'}
            {activeTab === 'listings' && 'Discover a curated selection of short-let properties tailored for your needs'}
            {activeTab === 'aboutus' && 'Connecting property owners and booking agents in a dynamic ecosystem'}
          </p>
        </div>
      </div>
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'services' && <Services />}
      {activeTab === 'listings' && <PropertyListings />}
      {activeTab === 'aboutus' && <AboutUs />}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 static bottom-0 w-full">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-white text-xl font-semibold mb-4">Omarey</h3>
          <p className="text-gray-400 leading-relaxed">
            All-in-one platform to manage bookings, payments, clients, and
            properties with ease.
          </p>
          <img src="/logo.png" alt="Omarey Logo" className="h-16 w-36 mt-4" />
        </div>

        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-3">
            <li><a href="#" className="hover:text-white">Dashboard</a></li>
            <li><a href="#" className="hover:text-white">Bookings</a></li>
            <li><a href="#" className="hover:text-white">Analytics</a></li>
            <li><a href="#" className="hover:text-white">Payments</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Property Tools</h4>
          <ul className="space-y-3">
            <li><a href="#" className="hover:text-white">List a Property</a></li>
            <li><a href="#" className="hover:text-white">Tenant Screening</a></li>
            <li><a href="#" className="hover:text-white">Maintenance</a></li>
            <li><a href="#" className="hover:text-white">Owner Portal</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Accra, Ghana</li>
            <li>support@Omarey.com</li>
            <li>+233 53 340 1119</li>
          </ul>

          <div className="flex gap-4 mt-6">
            <a href="#" className="hover:text-white text-xl">🌐</a>
            <a href="#" className="hover:text-white text-xl">📘</a>
            <a href="#" className="hover:text-white text-xl">🐦</a>
            <a href="#" className="hover:text-white text-xl">📸</a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-16 pt-8 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Omarey. All rights reserved.</p>
      </div>
    </footer>
  );
}