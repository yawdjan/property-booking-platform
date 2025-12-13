import React from 'react';
import { Home, Key, Users, TrendingUp, Shield, Award, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
            color: "blue"
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
            color: "amber"
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
            color: "blue"
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
            color: "amber"
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-500/20 to-primary-50">

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-amber-50">Our Services</h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                        Empowering property owners and booking agents through technology, trust, and excellence
                    </p>
                </div>
            </div>

            {/* About Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                    <h2 className="text-4xl font-bold text-amber-950 mb-6 text-center">Welcome To Omarey</h2>
                    <div className="prose prose-lg max-w-none text-amber-900 leading-relaxed space-y-4">
                        <p>
                            To our <span className="font-bold text-secondary-500">Users</span>, we are more than just a booking portal—we are a dynamic ecosystem designed for two key players: discerning property owners and ambitious booking agents.
                        </p>
                        <p>
                            Our platform was born from a simple observation: the process for agents to discover and book exceptional short-let properties was fragmented, and property owners struggled to gain consistent, high-quality exposure. We bridge this gap.
                        </p>
                        <p>
                            <span className="font-semibold text-secondary-500">For Property Owners</span>, we provide a streamlined, powerful dashboard to list your property, manage availability, and connect directly with a network of vetted agents who can fill your calendar with reliable bookings. Maximize your occupancy and revenue with ease.
                        </p>
                        <p>
                            <span className="font-semibold text-secondary-500">For Booking Agents</span>, we offer a curated portfolio of verified, high-quality short-let properties. Our tools simplify search, comparison, and booking, freeing you to focus on what you do best—serving your clients and growing your business.
                        </p>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-4xl font-bold text-center text-amber-950 mb-4">What We Offer</h2>
                <p className="text-center text-amber-800 text-lg mb-12 max-w-2xl mx-auto">
                    Comprehensive solutions designed to streamline your property management and booking experience
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-primary-200 group"
                        >
                            <div className={`p-8 ${service.color === 'blue' ? 'bg-gradient-to-br from-secondary-500 via-accent-500 to-cream-500' : 'bg-gradient-to-br from-primary-500 via-accent-500 to-secondary-400'}`}>
                                <div className="text-white mb-4">
                                    {service.icon}
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-3">{service.title}</h3>
                                <p className="text-blue-50 text-lg leading-relaxed">
                                    {service.description}
                                </p>
                            </div>

                            <div className="p-8 bg-gradient-to-br from-white to-cream-500/20">
                                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Key Features:</h4>
                                <ul className="space-y-3">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${service.color === 'blue' ? 'bg-primary-400' : 'bg-amber-600'}`}></span>
                                            <span className="text-amber-900">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${service.color === 'blue'
                                        ? 'bg-secondary-500 text-white hover:bg-accent-500'
                                        : 'bg-amber-700 text-white hover:bg-amber-600'
                                    }`}>
                                    Learn More
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-br from-secondary-500 to-accent-500 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-amber-50 mb-4">Why Choose Omarey</h2>
                    <p className="text-center text-amber-100 text-lg mb-12 max-w-2xl mx-auto">
                        Built on the pillars of trust, quality, efficiency, and growth
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-amber-600/30 hover:bg-white/20 transition-all duration-300"
                            >
                                <div className="text-blue-300 mb-4">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-bold text-amber-50 mb-3">{benefit.title}</h3>
                                <p className="text-amber-100 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="bg-gradient-to-r from-secondary-500 to-primary-400 rounded-3xl shadow-2xl p-12 text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join our ecosystem today and experience the future of short-let property management
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button disabled className="px-8 py-4 bg-white text-secondary-500 rounded-full font-semibold text-lg hover:bg-amber-50 transition-all shadow-lg ">
                             Email Us To List Your Property
                        </button>
                        <div className='ml-5 mr-5 self-center text-amber-200 text-xl'><h2 className=''>or</h2></div>
                        <button  
                            onClick={() => navigate('/register')} // <--- 4. Fix: Use navigate to go to the register route
                            className="px-8 py-4 bg-amber-700 text-white rounded-full font-semibold text-lg hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Become an Agent
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}