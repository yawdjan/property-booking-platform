import React from 'react';
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="relative">
            {firstContent()}
            {thirdContent()}
        </div>
    );
};

function firstContent() {
    return (
        <div className="-mt-24 py-20 bg-gradient-to-br from-cream-500/20 to-primary-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-lg font-bold mt-12 mb-4 text-secondary-500 uppercase tracking-wide">Why Choose Omarey For Agents</p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-950">Manage Bookings & Maximize Earnings Effortlessly</h2>
                    <p className="text-xl text-amber-800 max-w-3xl mx-auto">Everything you need to succeed as a booking agent in one powerful platform</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary-100 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-amber-950">Easy Booking</h3>
                        <p className="text-amber-800 leading-relaxed">Check availability and create bookings in seconds with our intuitive platform</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary-100 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-amber-950">Automatic Commissions</h3>
                        <p className="text-amber-800 leading-relaxed">Earn commissions on every successful booking automatically</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary-100 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-amber-950">Client Management</h3>
                        <p className="text-amber-800 leading-relaxed">Generate payment links and track all your bookings seamlessly</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary-100 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-amber-950">Real-Time Analytics</h3>
                        <p className="text-amber-800 leading-relaxed">Monitor your performance and earnings with detailed insights</p>
                    </div>
                </div>
                
                {/* Hero Section with Building Illustrations */}
                <div className="relative text-center mt-20 h-screen w-full overflow-hidden flex items-center justify-center">
                    {/* Decorative Elements */}
                    <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-300 rounded-full opacity-60 blur-2xl"></div>
                    <div className="absolute bottom-40 left-20 w-40 h-40 bg-secondary-300 rounded-full opacity-40 blur-3xl"></div>
                    
                    {/* Building Illustrations */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-4 px-8 pb-8">
                        <div className="w-32 h-48 bg-white/90 rounded-t-2xl relative shadow-2xl border-2 border-primary-100">
                            <div className="absolute top-0 w-full h-8 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-t-2xl"></div>
                            <div className="grid grid-cols-3 gap-2 p-3 mt-8">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="w-full h-6 bg-blue-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                        <div className="w-40 h-64 bg-white/90 rounded-t-2xl relative shadow-2xl border-2 border-primary-100">
                            <div className="absolute top-0 w-full h-10 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-t-2xl"></div>
                            <div className="grid grid-cols-3 gap-2 p-3 mt-10">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-full h-6 bg-green-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                        <div className="w-36 h-56 bg-white/90 rounded-t-2xl relative shadow-2xl border-2 border-primary-100">
                            <div className="absolute top-0 w-full h-8 bg-gradient-to-r from-primary-400 to-amber-600 rounded-t-2xl"></div>
                            <div className="grid grid-cols-3 gap-2 p-3 mt-8">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-full h-6 bg-pink-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                        <div className="w-32 h-40 bg-white/90 rounded-t-2xl relative shadow-2xl border-2 border-primary-100">
                            <div className="absolute top-0 w-full h-6 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-t-2xl"></div>
                            <div className="grid grid-cols-3 gap-2 p-3 mt-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-full h-6 bg-purple-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative Plants */}
                    <div className="absolute bottom-8 left-20">
                        <div className="w-16 h-24 relative">
                            <div className="absolute bottom-0 w-2 h-16 bg-amber-700 left-1/2 transform -translate-x-1/2 rounded-full"></div>
                            <div className="absolute top-0 w-12 h-16 bg-green-400 rounded-full opacity-80"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-8 right-20">
                        <div className="w-16 h-24 relative">
                            <div className="absolute bottom-0 w-2 h-16 bg-amber-700 left-1/2 transform -translate-x-1/2 rounded-full"></div>
                            <div className="absolute top-0 w-12 h-16 bg-green-400 rounded-full opacity-80"></div>
                        </div>
                    </div>
                    
                    <div className="relative z-1 w-full h-full flex flex-col justify-center text-left px-8 md:px-16">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-amber-800/80 mb-6 drop-shadow-2xl">
                            Streamline Your Property Bookings
                        </h1>
                        <p className="text-xl md:text-2xl text-amber-800/90 mb-8 drop-shadow-lg max-w-2xl">
                            Book properties for your clients and earn commissions effortlessly
                        </p>
                        <button className="px-12 py-5 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-full text-xl font-semibold hover:from-secondary-600 hover:to-accent-600 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 w-fit">
                            Get Started Free
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function thirdContent() {
    return (
        <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-orange-50">
            <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">

                {/* Left column (Image) */}
                <div className="h-64 md:h-screen w-full order-2 md:order-1">
                    <img
                        src="https://images.unsplash.com/photo-1621919200669-2779566a6eaf?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0"
                        alt="Property dashboard"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right column (Text) */}
                <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white order-1 md:order-2">
                    <div className="max-w-xl">
                        <p className="text-secondary-500 font-bold mb-2 uppercase tracking-wide">Powerful Dashboard</p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-amber-950">Everything You Need in One Place</h2>

                        <p className="text-lg md:text-xl text-amber-800 mb-8 leading-relaxed">
                            Monitor your bookings, track commissions, and manage client information all from a single, intuitive dashboard. Built for efficiency, designed for success.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-8 py-4 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-xl font-semibold text-lg hover:from-secondary-600 hover:to-accent-600 transition-all shadow-lg hover:shadow-xl">
                                Get Started
                            </button>
                            <button className="px-8 py-4 bg-white border-2 border-primary-400 text-primary-400 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all">
                                See Demo
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// function secondContent() {
//     return (
//         <div className="min-h-screen flex items-center justify-center bg-slate-400">
//             <div className="w-full max-w-7xl px-4">
//                 <div className="relative rounded-xl overflow-hidden shadow-lg">
//                     <img
//                         src="https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=1467&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//                         alt="Property management"
//                         className="w-full h-96 object-cover"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
//                         <div className="p-8 text-white">
//                             <h2 className="text-3xl font-bold">Discover Our Features</h2>
//                             <p className="mt-2 max-w-2xl text-lg">
//                                 Manage listings, bookings, clients and commissions from one intuitive dashboard.
//                             </p>
//                             <button className="mt-4 px-6 py-3 bg-green-400 text-gray-900 rounded-full font-semibold hover:bg-green-300 transition">
//                                 Learn More
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
