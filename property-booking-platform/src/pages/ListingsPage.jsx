import { useState } from 'react';
import { Search, MapPin, Bed, Bath, Square, Heart, Filter, ChevronDown } from 'lucide-react';

export default function PropertyListings() {
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterOpen, setFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const properties = [
    {
      id: 1,
      title: "Modern Downtown Loft",
      price: 2500,
      location: "Downtown, New York",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      image: "https://images.unsplash.com/photo-1502672260066-6bc355756145?w=800",
      type: "Apartment",
      status: "Not Available"
    },
    {
      id: 2,
      title: "Luxury Beachfront Villa",
      price: 5800,
      location: "Miami Beach, FL",
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      type: "House",
      status: "Available"
    },
    {
      id: 3,
      title: "Cozy Studio Apartment",
      price: 1200,
      location: "Brooklyn, NY",
      bedrooms: 1,
      bathrooms: 1,
      sqft: 550,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      type: "Studio",
      status: "Available"
    },
    {
      id: 4,
      title: "Suburban Family Home",
      price: 3200,
      location: "Austin, TX",
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 2100,
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
      type: "House",
      status: "Pending"
    },
    {
      id: 5,
      title: "Penthouse Suite",
      price: 8500,
      location: "Manhattan, NY",
      bedrooms: 3,
      bathrooms: 3,
      sqft: 3200,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      type: "Penthouse",
      status: "Available"
    },
    {
      id: 6,
      title: "Garden View Condo",
      price: 1800,
      location: "Portland, OR",
      bedrooms: 2,
      bathrooms: 1,
      sqft: 900,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      type: "Condo",
      status: "Available"
    }
  ];

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-primary-50">

      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Property</h1>
          <p className="text-xl text-primary-50 mb-8">Discover amazing places to call home</p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <Search className="text-amber-600" size={20} />
              <input
                type="text"
                placeholder="Search by location, property type..."
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-amber-700/60"
              />
            </div>

            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition text-amber-900"
            >
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown size={18} />
            </button>

            <button className="px-8 py-3 bg-secondary-500 text-white rounded-xl font-semibold hover:bg-primary-400 transition shadow-lg">
              Search
            </button>
          </div>

          {/* Quick Filters */}
          {filterOpen && (
            <div className="mt-4 bg-white rounded-2xl shadow-xl p-6 text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Property Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>All Types</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Condo</option>
                    <option>Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Price Range</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Any Price</option>
                    <option>$0 - $1,500</option>
                    <option>$1,500 - $3,000</option>
                    <option>$3,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bedrooms</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Any</option>
                    <option>1+</option>
                    <option>2+</option>
                    <option>3+</option>
                    <option>4+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bathrooms</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Any</option>
                    <option>1+</option>
                    <option>2+</option>
                    <option>3+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Results Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-950">Available Properties</h2>
            <p className="text-amber-800">{properties.length} properties found</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'grid'
                  ? 'bg-primary-400 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'list'
                  ? 'bg-primary-400 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Property Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
          }`}>
          {properties.map(property => (
            <div
              key={property.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${property.status === 'Available'
                      ? 'bg-primary-400 text-white'
                      : 'bg-gray-500 text-white'
                    }`}>
                    {property.status}
                  </span>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(property.id)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition"
                >
                  <Heart
                    size={20}
                    className={favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-amber-700'}
                  />
                </button>

                {/* Property Type */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-amber-900/90 backdrop-blur rounded-full text-sm font-semibold text-gray-50">
                    {property.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-amber-700 group-hover:text-secondary-500 transition">
                    {property.title}
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-400">
                      ${property.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-amber-700">per month</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-amber-800 mb-4">
                  <MapPin size={16} />
                  <span className="text-sm">{property.location}</span>
                </div>

                {/* Property Stats */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-amber-900">
                    <Bed size={18} />
                    <span className="text-sm font-medium">{property.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-900">
                    <Bath size={18} />
                    <span className="text-sm font-medium">{property.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-900">
                    <Square size={18} />
                    <span className="text-sm font-medium">{property.sqft} sqft</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full mt-4 py-3 bg-gradient-to-r from-primary-400 to-indigo-600 text-white rounded-xl font-semibold hover:from-secondary-500 hover:to-indigo-800 transition shadow-lg">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}