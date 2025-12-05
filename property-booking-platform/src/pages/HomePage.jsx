import React from 'react';
import { Calendar, DollarSign, Users } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="relative">
            {firstContent()}
            {/* {secondContent()} */}
            {thirdContent()}
        </div>
    );
};

function firstContent() {
    return (
        <div className="-mt-24 py-16" style={{ background: 'linear-gradient(180deg, #A8866A 0%, #CBB59A 50%, #A8866A 100%)' }}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <p className="text-lg font-bold mt-12 mb-8 text-amber-100">WHY CHOOSE PROP BOOKINGS FOR AGENTS</p>
                    <h2 className="text-3xl mb-4 text-white">To manage bookings and earn commissions with ease</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="bg-transparent p-8 rounded-xl hover:shadow-md transition-shadow">
                        <Calendar className="w-12 h-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                        <p className="text-amber-100">Check availability and create bookings in seconds</p>
                    </div>
                    <div className="bg-transparent p-8 rounded-xl hover:shadow-md transition-shadow">
                        <DollarSign className="w-12 h-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Automatic Commissions</h3>
                        <p className="text-amber-100">Earn commissions on every successful booking</p>
                    </div>
                    <div className="bg-transparent p-8 rounded-xl hover:shadow-md transition-shadow">
                        <Users className="w-12 h-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Client Management</h3>
                        <p className="text-amber-100">Generate payment links and track all your bookings</p>
                    </div>
                    <div className="bg-transparent p-8 rounded-xl hover:shadow-md transition-shadow">
                        <Users className="w-12 h-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Client Management</h3>
                        <p className="text-amber-100">Generate payment links and track all your bookings</p>
                    </div>
                </div>
                <div className="relative text-center h-screen w-full overflow-hidden flex items-center justify-center bg-transparent">
                    {/* Decorative Elements */}
                    <div className="absolute top-56 right-20 w-32 h-32 bg-yellow-300 rounded-full opacity-80"></div>
                    {/* <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-stone-800/30 to-transparent"></div> */}
                    {/* Building Illustrations (simple geometric shapes) */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-4 px-8 pb-8">
                        <div className="w-32 h-48 bg-white/90 rounded-t-lg relative">
                            <div className="absolute top-0 w-full h-8 bg-blue-400 rounded-t-lg"></div>
                            <div className="grid grid-cols-3 gap-2 p-3 mt-8">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="w-full h-6 bg-blue-200/50 rounded"></div>
                                ))}
                            </div>
                        </div>
                        <div className="w-40 h-64 bg-gray-300/90 rounded-t-lg relative">
                            <div className="absolute top-0 w-full h-10 bg-green-400 rounded-t-lg"></div>
                            <div className="grid grid-cols-3 gap-2 p-3 mt-10">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-full h-6 bg-green-200/50 rounded"></div>
                                ))}
                            </div>
                        </div>
                        <div className="w-36 h-56 bg-white/90 rounded-t-lg relative">
                            <div className="absolute top-0 w-full h-8 bg-pink-400 rounded-t-lg"></div>
                            <div className="grid grid-cols-3 gap-2 p-3 mt-8">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-full h-6 bg-pink-200/50 rounded"></div>
                                ))}
                            </div>
                        </div>
                        <div className="w-32 h-40 bg-gray-100/90 rounded-t-lg relative">
                            <div className="absolute top-0 w-full h-6 bg-purple-400 rounded-t-lg"></div>
                            <div className="grid grid-cols-3 gap-2 p-3 mt-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-full h-6 bg-purple-200/50 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Decorative Plants */}
                    <div className="absolute bottom-8 left-20">
                        <div className="w-16 h-24 relative">
                            <div className="absolute bottom-0 w-2 h-16 bg-green-600 left-1/2 transform -translate-x-1/2"></div>
                            <div className="absolute top-0 w-12 h-16 bg-green-500 rounded-full opacity-80"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-8 right-20">
                        <div className="w-16 h-24 relative">
                            <div className="absolute bottom-0 w-2 h-16 bg-green-600 left-1/2 transform -translate-x-1/2"></div>
                            <div className="absolute top-0 w-12 h-16 bg-green-500 rounded-full opacity-80"></div>
                        </div>
                    </div>
                    <div className="relative z-4 w-full h-full block text-left px-4">
                        <h1 className="text-6xl text-left font-bold mt-32 text-white mb-6 drop-shadow-lg">
                            Streamline Your Property Bookings
                        </h1>
                        <p className="text-2xl text-left text-amber-100 mb-8 drop-shadow-md w-full mx-auto">
                            Book properties for your clients and earn commissions effortlessly
                        </p>
                        <button className="px-12 py-5 bg-green-400 text-gray-900 rounded-full text-xl font-semibold hover:bg-green-300 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                            Get Started Free
                        </button>
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


function thirdContent() {
    return (
        <div className="min-h-screen w-full overflow-hidden bg-gray-50">
            <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">

                {/* Left column (Image) */}
                <div className="h-64 md:h-screen w-full">
                    <img
                        src="https://images.unsplash.com/photo-1621919200669-2779566a6eaf?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0"
                        alt="Property dashboard"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right column (Text) */}
                <div className="flex flex-col justify-center p-6 md:p-10 bg-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Lorem Ipsum</h2>

                    <p className="text-base md:text-lg text-gray-700 mb-6">
                        Monitor your bookings, track commissions, and manage client information all in one place.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, perspiciatis quae in animi, ab pariatur voluptates maxime suscipit mollitia nemo voluptatem distinctio architecto alias tempore quibusdam aspernatur, inventore asperiores porro.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-500 transition">
                            Get Started
                        </button>
                        <button className="px-6 py-3 bg-transparent border border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition">
                            See Demo
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
