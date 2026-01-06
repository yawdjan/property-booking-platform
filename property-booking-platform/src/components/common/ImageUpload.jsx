import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { propertiesAPI } from '../../services/api';

export default function ImageUpload({ images, onChange, maxImages = 10, maxSizeMB = 50 }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 10240;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length + images.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Filter for images only
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select image files only');
      return;
    }

    // Check file sizes
    const maxSizeBytes = maxSizeMB * 10240 * 1024;
    const oversizedFiles = imageFiles.filter(file => file.size > maxSizeBytes);
    
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed ${maxSizeMB}MB limit:\n${oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join('\n')}`);
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      // Upload all images sequentially to avoid overwhelming the server
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const url = await propertiesAPI.uploadImage(file);
        uploadedUrls.push(url.data.url);
      }
      
      // Add to existing images
      onChange([...images, ...uploadedUrls]);
      console.log('📸 All URLs:', uploadedUrls); // ADD THIS
      
      alert(`${uploadedUrls.length} image(s) uploaded successfully!`);
      setUploadProgress({});
    } catch (error) {
      alert(`Failed to upload images. Please try again. ${error.message}`);
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }

  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-primary-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        {uploading ? (
          <div>
            <Loader className="w-8 h-8 mx-auto mb-4 text-primary-400 animate-spin" />
            <p className="text-lg font-medium mb-2">Uploading images...</p>
            <div className="space-y-2 max-w-md mx-auto">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename} className="text-left">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate max-w-[200px]">{filename}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">
              Drop high-resolution images here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports: JPG, PNG, GIF, WebP, TIFF
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: {maxSizeMB}MB per image
            </p>
            <p className="text-xs text-primary-400 font-medium mt-2">
              ✨ Full quality preserved - No compression
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Property ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Loading...';
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary-400 text-white text-xs rounded shadow">
                  Cover Photo
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{images.length} / {maxImages} images uploaded</span>
        <span>Full quality preserved</span>
      </div>
    </div>
  );
}