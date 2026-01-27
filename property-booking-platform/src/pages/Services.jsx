import React from 'react';
import { Home, Key, Users, TrendingUp, Shield, Award, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Services() {
    const navigate = useNavigate();
    
    const services = [
        {
            icon: <Key className="w-12 h-12" />,
            title: "Renting",
            description: "Discover exceptional short-let properties with verified listings. Our curated portfolio connects you with quality properties that meet your clients' needs.",
            features: [
                "Verified property listings",
                "Instant availability checking",
                "Seamless booking process",
                "Competitive pricing"
            ],
            color: "blue",
            gradient: "from-secondary-500 to-accent-500"
        },
        {
            icon: <Home className="w-12 h-12" />,
            title: "Buying",
            description: "Access premium properties for purchase. Our platform showcases investment opportunities with detailed information to help you make informed decisions.",
            features: [
                "Comprehensive property details",
                "Market insights & analytics",
                "Direct owner connections",
                "Transparent pricing"
            ],
            color: "amber",
            gradient: "from-primary-400 to-amber-600"
        },
        {
            icon: <Users className="w-12 h-12" />,
            title: "Agent Support",
            description: "Empowering booking agents with tools, resources, and dedicated support to grow your business and serve clients with excellence.",
            features: [
                "Dedicated agent dashboard",
                "Commission tracking",
                "Training & resources",
                "Priority customer support"
            ],
            color: "blue",
            gradient: "from-secondary-500 to-accent-500"
        },
        {
            icon: <TrendingUp className="w-12 h-12" />,
            title: "Advertising",
            description: "Maximize your property visibility. Our marketing platform connects property owners with a network of vetted agents for consistent, high-quality bookings.",
            features: [
                "Featured listings",
                "Targeted agent network",
                "Performance analytics",
                "Occupancy optimization"
            ],
            color: "amber",
            gradient: "from-primary-400 to-amber-600"
        }
    ];

    const benefits = [
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Trust & Security",
            description: "Verified listings and vetted agents ensure reliable transactions"
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: "Quality Assurance",
            description: "Curated portfolio of high-quality short-let properties"
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "Time Efficiency",
            description: "Streamlined tools that simplify search, comparison, and booking"
        },
        {
            icon: <DollarSign className="w-8 h-8" />,
            title: "Revenue Growth",
            description: "Maximize occupancy and earnings through our connected ecosystem"
        }
    ];

    const features = [
        {
            title: "Smart Booking System",
            description: "Our intelligent booking system automatically syncs availability across all platforms, preventing double bookings and maximizing your occupancy rates.",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
        },
        {
            title: "Commission Management",
            description: "Track and manage your earnings in real-time with transparent commission structures and automated payout systems.",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
        },
        {
            title: "Analytics Dashboard",
            description: "Get deep insights into your property performance with comprehensive analytics and reporting tools.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-500/20 to-primary-50">

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-accent-600 to-secondary-600 text-white py-24 px-4">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto text-center relative z-1">
                    <p className="text-amber-50 text-2xl font-bold mb-4 uppercase tracking-wide">What We Offer</p>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">Our Services</h1>
                    <p className="text-xl md:text-2xl text-amber-50 max-w-3xl mx-auto leading-relaxed">
                        Empowering property owners and booking agents through technology, trust, and excellence
                    </p>
                </div>
            </div>

            {/* About Section */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-primary-100">
                    <div className="text-center mb-8">
                        <p className="text-black text-2xl font-bold mb-2 uppercase tracking-wide">Welcome To Omarey</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-amber-950 mb-6">A Dynamic Ecosystem</h2>
                    </div>
                    
                    <div className="prose prose-lg max-w-none text-amber-900 leading-relaxed space-y-6">
                        <p className="text-xl text-center">
                            To our <span className="font-bold text-secondary-700">Users</span>, we are more than just a booking portal, we are a dynamic ecosystem 
                            designed for two key players (discerning property owners and ambitious booking 
                            agents).
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-8 my-8">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                                <div className="w-12 h-12 bg-gradient-to-br from-secondary-700 to-accent-500 rounded-xl flex items-center justify-center mb-4">
                                    <Home className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-xl text-amber-950 mb-3">For Property Owners</h3>
                                <p className="text-amber-800">
                                    We provide a streamlined, powerful dashboard to list your property, manage availability, and connect directly with a network of vetted agents who can fill your calendar with reliable bookings.
                                </p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-100">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-amber-600 rounded-xl flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-xl text-amber-950 mb-3">For Booking Agents</h3>
                                <p className="text-amber-800">
                                    We offer a curated portfolio of verified, high-quality short-let properties. Our tools simplify search, comparison, and booking, freeing you to focus on serving your clients.
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-lg text-center italic text-amber-700 bg-primary-50 p-6 rounded-2xl border-2 border-primary-100">
                            Our platform was born from a simple observation. The process for agents to discover 
                            and book exceptional short-let properties was fragmented, and property owners 
                            struggled to gain consistent, high-quality exposure. We bridge this gap.
                        </p>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <p className="text-secondary-500 font-bold mb-2 uppercase tracking-wide">Comprehensive Solutions</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-amber-950 mb-4">What We Offer</h2>
                    <p className="text-xl text-amber-800 max-w-2xl mx-auto">
                        Streamline your property management and booking experience
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-primary-100 group"
                        >
                            <div className={`p-8 bg-gradient-to-br ${service.gradient}`}>
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <div className="text-black">
                                        {service.icon}
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-black mb-3">{service.title}</h3>
                                <p className="text-black text-lg leading-relaxed">
                                    {service.description}
                                </p>
                            </div>

                            <div className="p-8">
                                <h4 className="font-bold text-amber-950 mb-4 text-lg flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-secondary-500" />
                                    Key Features
                                </h4>
                                <ul className="space-y-3 mb-6">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-gradient-to-br ${service.gradient}`}></span>
                                            <span className="text-amber-800">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r ${service.gradient} text-black`}>
                                    Learn More
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <p className="text-secondary-500 font-bold mb-2 uppercase tracking-wide">Platform Features</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-amber-950 mb-4">Built For Success</h2>
                    <p className="text-xl text-amber-800 max-w-2xl mx-auto">
                        Powerful tools designed to help you grow your business
                    </p>
                </div>

                <div className="space-y-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`grid md:grid-cols-2 gap-8 items-center ${
                                index % 2 === 1 ? 'md:flex-row-reverse' : ''
                            }`}
                        >
                            <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary-100">
                                    <h3 className="text-3xl font-bold text-amber-950 mb-4">{feature.title}</h3>
                                    <p className="text-lg text-amber-800 leading-relaxed mb-6">
                                        {feature.description}
                                    </p>
                                    <button className="px-6 py-3 bg-gradient-to-r from-primary-400 to-secondary-500 text-white rounded-xl font-semibold hover:from-primary-500 hover:to-secondary-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                                        Explore Feature
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                                <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-primary-100">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rest of Services page content... */}

            {/* Benefits Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-secondary-500 to-accent-500 py-20 px-4">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto relative z-1">
                    <div className="text-center mb-12">
                        <p className="text-black font-bold mb-2 uppercase tracking-wide">Our Commitment</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Why Choose Omarey</h2>
                        <p className="text-xl text-black max-w-2xl mx-auto">
                            Built on the pillars of trust, quality, efficiency, and growth
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 transition-all duration-300 group"
                            >
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <div className="text-black">
                                        {benefit.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-black mb-3">{benefit.title}</h3>
                                <p className="text-black leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="relative overflow-hidden bg-gradient-to-br from-secondary-500 to-primary-400 rounded-3xl shadow-2xl p-12 text-center text-black">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-600/30 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-1">
                        <h2 className="text-4xl text-black md:text-5xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
                            Join our ecosystem today and experience the future of short-let property management
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => window.location.href = 'mailto:support@omarey.com?subject=List My Property'}
                                className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Email Us To List Your Property
                            </button>
                            <div className='hidden sm:flex items-center text-black text-2xl font-light px-4'>or</div>
                            <button  
                                onClick={() => navigate('/register')}
                                className="px-10 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-black rounded-full font-bold text-lg hover:from-amber-700 hover:to-amber-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <Users className="w-5 h-5" />
                                Become an Agent
                            </button>
                        </div>
                        
                        {/* Trust Indicators */}
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-black">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>100+ Properties</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Verified Agents</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}