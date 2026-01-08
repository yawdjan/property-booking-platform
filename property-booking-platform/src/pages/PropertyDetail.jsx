/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Users, Bed, Bath, ArrowLeft, Check,
  Wifi, Car, Tv, Utensils, Wind, Coffee, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { propertiesAPI } from '../services/api';

// Amenity icon mapping
const amenityIcons = {
  'WiFi': Wifi,
  'Parking': Car,
  'TV': Tv,
  'Kitchen': Utensils,
  'Air Conditioning': Wind,
  'Coffee Maker': Coffee,
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getById(id);
      setProperty(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const previousImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const getAmenityIcon = (amenity) => {
    const Icon = amenityIcons[amenity] || Check;
    return <Icon className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-500/20 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800 text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-500/20 to-primary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border-2 border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-amber-950 mb-2">Property Not Found</h2>
            <p className="text-amber-800 mb-6">{error || 'This property does not exist or has been removed.'}</p>
            <button
              onClick={() => navigate('/listings')}
              className="px-6 py-3 bg-gradient-to-r from-primary-400 to-secondary-500 text-white rounded-xl font-semibold hover:from-primary-500 hover:to-secondary-600 transition-all shadow-lg"
            >
              Back to Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasImages = property.images && property.images.length > 0;
  const currentImage = hasImages ? property.images[currentImageIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-500/20 to-primary-50">
      {/* Back Button */}
      <div className="bg-white border-b-2 border-primary-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/listings')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-primary-100">
          {hasImages ? (
            <div className="relative h-96 md:h-[500px]">
              <img
                src={currentImage}
                alt={`${property.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowGallery(true)}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80';
                }}
              />

              {/* Image Navigation */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-amber-950" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-amber-950" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                    <p className="text-white font-semibold">
                      {currentImageIndex + 1} / {property.images.length}
                    </p>
                  </div>
                </>
              )}

              {/* View All Photos Button */}
              <button
                onClick={() => setShowGallery(true)}
                className="absolute bottom-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full font-semibold text-amber-950 hover:bg-white transition-all shadow-lg"
              >
                View All Photos
              </button>
            </div>
          ) : (
            <div className="h-96 md:h-[500px] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-12 h-12 text-white" />
                </div>
                <p className="text-gray-600 text-lg">No images available</p>
              </div>
            </div>
          )}

          {/* Thumbnail Strip */}
          {hasImages && property.images.length > 1 && (
            <div className="p-4 bg-gray-50 border-t-2 border-gray-100">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex
                        ? 'border-primary-400 shadow-lg'
                        : 'border-gray-200 hover:border-primary-200'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary-100">
              <h1 className="text-4xl font-bold text-amber-950 mb-4">{property.name}</h1>

              <div className="flex items-start gap-2 mb-6">
                <MapPin className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <p className="text-xl text-amber-800">{property.address}</p>
              </div>

              <div className="flex flex-wrap gap-6 text-amber-800">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold">{property.maxGuests} Guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold">{property.bathrooms} Bathrooms</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary-100">
                <h2 className="text-2xl font-bold text-amber-950 mb-4">About This Property</h2>
                <p className="text-amber-800 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary-100">
                <h2 className="text-2xl font-bold text-amber-950 mb-6">Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center text-white">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="text-amber-950 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card - Sticky */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-primary-100">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-amber-950">
                      ¢{parseFloat(property.nightlyRate).toFixed(0)}
                    </span>
                    <span className="text-amber-700">/ night</span>
                  </div>
                  {parseFloat(property.cleaningFee) > 0 && (
                    <p className="text-sm text-amber-700">
                      + ¢{parseFloat(property.cleaningFee).toFixed(0)} cleaning fee
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-primary-50 rounded-xl">
                    <p className="text-sm text-amber-700 mb-1">Price Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-amber-900">
                        <span>Nightly Rate</span>
                        <span className="font-semibold">¢{parseFloat(property.nightlyRate).toFixed(2)}</span>
                      </div>
                      {parseFloat(property.cleaningFee) > 0 && (
                        <div className="flex justify-between text-amber-900">
                          <span>Cleaning Fee</span>
                          <span className="font-semibold">¢{parseFloat(property.cleaningFee).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* 
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-4 bg-gradient-to-r from-primary-400 to-secondary-500 text-white rounded-xl font-bold text-lg hover:from-primary-500 hover:to-secondary-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Book Now
                </button> */}

                <p className="text-center text-sm text-amber-700 mt-4">
                  Register as an agent to book this property
                </p>

                {/* Property Features Summary */}
                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                  <h3 className="font-bold text-amber-950 mb-3">Property Highlights</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Instant Booking Available</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-800">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Verified Property</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-800">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      {showGallery && hasImages && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setShowGallery(false)} >
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              setShowGallery(false);
            }}
            className="absolute z-50 top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.name} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80';
              }}
            />

            {property.images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-white font-semibold">
                    {currentImageIndex + 1} / {property.images.length}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}