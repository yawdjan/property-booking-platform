import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { propertiesAPI } from '../../services/api';
import ImageUpload from '../common/ImageUpload';

export default function PropertySettings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    nightlyRate: '',
    cleaningFee: '',
    commissionRate: '',
    maxGuests: '4',
    bedrooms: '2',
    bathrooms: '2',
    images: [],
    amenities: ['']
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      setProperties(response.data);
    } catch (error) {
      setError(error.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      description: '',
      nightlyRate: '',
      cleaningFee: '0',
      commissionRate: '12',
      maxGuests: '4',
      bedrooms: '2',
      bathrooms: '2',
      images: [''],
      amenities: ['']
    });
    setEditingProperty(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name || '',
      address: property.address || '',
      description: property.description || '',
      nightlyRate: property.nightlyRate || '',
      cleaningFee: property.cleaningFee || '',
      commissionRate: property.commissionRate || '',
      maxGuests: property.maxGuests || '4',
      bedrooms: property.bedrooms || '2',
      bathrooms: property.bathrooms || '2',
      images: property.images?.length > 0 ? property.images : [''],
      amenities: property.amenities?.length > 0 ? property.amenities : ['']
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleImageChange = (index, value) => {
  //   const newImages = [...formData.images];
  //   newImages[index] = value;
  //   setFormData(prev => ({ ...prev, images: newImages }));
  // };

  // const addImageField = () => {
  //   setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  // };

  // const removeImageField = (index) => {
  //   if (formData.images.length > 1) {
  //     const newImages = formData.images.filter((_, i) => i !== index);
  //     setFormData(prev => ({ ...prev, images: newImages }));
  //   }
  // };

  const handleAmenityChange = (index, value) => {
    const newAmenities = [...formData.amenities];
    newAmenities[index] = value;
    setFormData(prev => ({ ...prev, amenities: newAmenities }));
  };

  const addAmenityField = () => {
    setFormData(prev => ({ ...prev, amenities: [...prev.amenities, ''] }));
  };

  const removeAmenityField = (index) => {
    if (formData.amenities.length > 1) {
      const newAmenities = formData.amenities.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, amenities: newAmenities }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Property name is required');
      return false;
    }
    if (!formData.address.trim()) {
      alert('Address is required');
      return false;
    }
    if (!formData.nightlyRate || parseFloat(formData.nightlyRate) <= 0) {
      alert('Valid nightly rate is required');
      return false;
    }
    if (!formData.commissionRate || parseFloat(formData.commissionRate) <= 0) {
      alert('Valid commission rate is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      const cleanedData = {
        ...formData,
        nightlyRate: parseFloat(formData.nightlyRate),
        cleaningFee: parseFloat(formData.cleaningFee) || 0,
        commissionRate: parseFloat(formData.commissionRate),
        maxGuests: parseInt(formData.maxGuests) || 1,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseFloat(formData.bathrooms).toFixed(1) || 1,
        images: formData.images,
        amenities: formData.amenities.filter(am => am.trim() !== '')
      };

      if (editingProperty) {
        await propertiesAPI.update(editingProperty.id, cleanedData);
        alert('Property updated successfully!');
      } else {
        await propertiesAPI.create(cleanedData);
        alert('Property created successfully!');
      }

      closeModal();
      loadProperties();
    } catch (error) {
      setError(error.message || 'Failed to save property');
      alert(error.message || 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertiesAPI.delete(propertyId);
      alert('Property deleted successfully!');
      loadProperties();
    } catch (error) {
      alert(error.message || 'Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading properties...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Property Management</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-secondary-500"
        >
          <Plus className="w-5 h-5" />
          Add New Property
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No properties yet</p>
          <button 
            onClick={openAddModal}
            className="px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-secondary-500"
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
              {property.images && property.images.length > 0 && property.images[0] ? (
                <img 
                  src={property.images[0]} 
                  alt={property.name} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{property.address}</p>
                <div className="space-y-2 text-sm mb-4">
                  <p><span className="font-medium">Nightly Rate:</span> ${property.nightlyRate}</p>
                  <p><span className="font-medium">Cleaning Fee:</span> ${property.cleaningFee}</p>
                  <p><span className="font-medium">Commission:</span> {property.commissionRate}%</p>
                  <p>
                    <span className="font-medium">Guests:</span> {property.maxGuests} | 
                    <span className="font-medium"> Beds:</span> {property.bedrooms} | 
                    <span className="font-medium"> Baths:</span> {property.bathrooms}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(property)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-secondary-500"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(property.id)}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Property Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              {/* Pricing */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nightly Rate ($) *</label>
                  <input
                    type="number"
                    name="nightlyRate"
                    value={formData.nightlyRate}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cleaning Fee ($)</label>
                  <input
                    type="number"
                    name="cleaningFee"
                    value={formData.cleaningFee}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Commission Rate (%) *</label>
                  <input
                    type="number"
                    name="commissionRate"
                    value={formData.commissionRate}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Max Guests</label>
                  <input
                    type="number"
                    name="maxGuests"
                    value={formData.maxGuests}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Property Images</label>
                <ImageUpload
                  images={formData.images}
                  onChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))}
                  maxImages={20}
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium mb-2">Amenities</label>
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={amenity}
                      onChange={(e) => handleAmenityChange(index, e.target.value)}
                      placeholder="WiFi, Pool, Parking..."
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    {formData.amenities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAmenityField(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAmenityField}
                  className="mt-2 px-4 py-2 bg-gray-100 rounded-lg"
                >
                  + Add Amenity
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary-400 text-white rounded-lg"
                >
                  {saving ? 'Saving...' : (editingProperty ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}