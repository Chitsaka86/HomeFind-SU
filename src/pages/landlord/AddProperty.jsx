import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "./landlordTheme";
import {
  XMarkIcon,
  PlusIcon,
  HomeModernIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createProperty } from "../../services/landlordDashboardService";

const ALL_AMENITIES = [
  "WiFi",
  "24hr water",
  "Caretaker",
  "Parking",
  "CCTV",
  "Backup power",
  "Laundry area",
  "Balcony",
  "Furnished rooms",
  "Elevator",
  "Gym",
  "Swimming pool",
];

const PROPERTY_TYPES = ["Bedsitter", "Studio", "1BR", "2BR", "3BR", "4BR+"];

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM = {
  title: "",
  location: "",
  locationLat: null,
  locationLng: null,
  price: "",
  type: "Bedsitter",
  status: "pending",
  description: "",
  amenities: [],
  rules: "",
  images: [],
};

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AddProperty({ onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isMapInitializing, setIsMapInitializing] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageErrors, setImageErrors] = useState([]);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!selectedLocation && !form.locationLat) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        setMapLoaded(false);
      }
      return;
    }

    if (isMapInitializing) return;
    if (mapInstanceRef.current) {
      const lat = form.locationLat || selectedLocation?.lat || -1.2864;
      const lng = form.locationLng || selectedLocation?.lon || 36.8172;
      mapInstanceRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      return;
    }

    setIsMapInitializing(true);

    const initMap = () => {
      try {
        const lat = form.locationLat || selectedLocation?.lat || -1.2864;
        const lng = form.locationLng || selectedLocation?.lon || 36.8172;

        mapInstanceRef.current = L.map(mapContainerRef.current, {
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
        }).setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        L.control.zoom({
          position: 'topright'
        }).addTo(mapInstanceRef.current);

        markerRef.current = L.marker([lat, lng], {
          draggable: true,
        }).addTo(mapInstanceRef.current);

        markerRef.current.on('dragend', function () {
          const position = markerRef.current.getLatLng();
          setForm(prev => ({
            ...prev,
            locationLat: position.lat,
            locationLng: position.lng,
          }));
          reverseGeocode(position.lat, position.lng);
        });

        setMapLoaded(true);
        setMapError(false);
        setIsMapInitializing(false);
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError(true);
        setIsMapInitializing(false);
      }
    };

    const timer = setTimeout(initMap, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [form.locationLat, form.locationLng, selectedLocation]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const searchLocations = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}&countrycodes=ke`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HomeFind-SU/1.0 (Strathmore University)'
          }
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      const formattedSuggestions = data.map(item => ({
        label: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.address || {},
      }));
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query) => searchLocations(query), 300),
    [searchLocations]
  );

  const handleLocationInputChange = (value) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    debouncedSearch(value);
  };

  const selectSuggestion = (suggestion) => {
    setSelectedLocation(suggestion);
    setForm(prev => ({
      ...prev,
      location: suggestion.label,
      locationLat: suggestion.lat,
      locationLng: suggestion.lon,
    }));
    setSearchQuery(suggestion.label);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HomeFind-SU/1.0 (Strathmore University)'
          }
        }
      );
      if (!response.ok) throw new Error('Reverse geocoding failed');
      const data = await response.json();
      if (data.display_name) {
        setForm(prev => ({
          ...prev,
          location: data.display_name,
        }));
        setSearchQuery(data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newErrors = [];
    const validFiles = [];

    if (form.images.length + files.length > MAX_IMAGES) {
      setImageErrors([`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - form.images.length} more.`]);
      setTimeout(() => setImageErrors([]), 5000);
      return;
    }

    setUploadingImages(true);

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`${file.name} exceeds 5MB limit`);
        continue;
      }
      
      if (!file.type.startsWith('image/')) {
        newErrors.push(`${file.name} is not an image file`);
        continue;
      }
      
      try {
        const compressedFile = await compressImage(file, 600, 600, 0.6);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = {
            id: Date.now() + Math.random() * 1000,
            url: e.target.result,
            file: compressedFile,
            caption: file.name.split('.')[0],
            isPrimary: form.images.length === 0,
          };
          setForm(prev => ({
            ...prev,
            images: [...prev.images, imageData],
          }));
          setUploadingImages(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        newErrors.push(`Failed to process ${file.name}`);
      }
    }

    if (newErrors.length > 0) {
      setImageErrors(newErrors);
      setTimeout(() => setImageErrors([]), 5000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId),
    }));
  };

  const setPrimaryImage = (imageId) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isPrimary: img.id === imageId,
      })),
    }));
  };

  const toggleAmenity = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.price || form.price <= 0) newErrors.price = "Valid price is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (form.images.length === 0) newErrors.images = "At least one image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    setErrors(prev => ({ ...prev, submit: '' }));
    
    if (!validateForm()) return;

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email) {
      setErrors({ submit: 'Please log in again to add a property.' });
      return;
    }

    try {
      console.log('📸 Images before submission:', form.images);
      console.log('📸 Number of images:', form.images.length);
      
      const submissionData = {
        title: form.title,
        location: form.location,
        locationLat: form.locationLat,
        locationLng: form.locationLng,
        price: parseFloat(form.price),
        type: form.type,
        status: form.status,
        description: form.description,
        amenities: form.amenities,
        rules: form.rules,
        images: form.images
          .filter((img) => img?.url)
          .map((img, index) => ({
            url: img.url,
            caption: img.caption || '',
            sortOrder: index,
          })),
      };

      console.log(' Submitting property with images:', submissionData.images.length);

      const result = await createProperty(submissionData);
      console.log(' Property created:', result);

      setSubmitted(true);
      setTimeout(() => {
        onSave?.(submissionData);
      }, 1000);

    } catch (error) {
      console.error(' Error creating property:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Failed to create property. Please try again.' 
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 30,
          textAlign: "center"
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: C.greenTint,
            color: C.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            fontSize: 28
          }}>
            ✓
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.text }}>Property submitted</h2>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>
            Your listing has been saved and sent for review.
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: C.textTer }}>
            We'll notify you once it's approved.
          </p>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: C.text,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: 16 }}>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Add property</h2>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textSec }}>Create a new listing for review</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "none",
              color: C.textSec,
              cursor: "pointer",
              padding: 4,
            }}
          >
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          {errors.submit && (
            <div style={{
              background: C.dangerTint,
              border: `1px solid ${C.danger}`,
              borderRadius: 6,
              padding: "10px 14px",
              color: C.danger,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div>
                <strong>Error:</strong> {errors.submit}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ ...labelStyle, fontSize: 11 }}>
              <HomeModernIcon style={{ width: 14, height: 14 }} />
              Property title
            </label>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. Kilimani View Apartment"
              style={{
                ...inputStyle,
                fontSize: 12,
                padding: "8px 12px",
                borderColor: errors.title ? C.danger : C.borderMid,
              }}
            />
            {errors.title && <p style={{ color: C.danger, fontSize: 10, margin: "3px 0 0" }}>{errors.title}</p>}
          </div>

          {/* Location with Autocomplete */}
          <div>
            <label style={{ ...labelStyle, fontSize: 11 }}>
              <MapPinIcon style={{ width: 14, height: 14 }} />
              Location
            </label>
            <div style={{ position: "relative" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${errors.location ? C.danger : C.borderMid}`,
                borderRadius: 6,
                background: "#fff",
                transition: "border-color 0.15s",
              }}>
                <MagnifyingGlassIcon style={{ 
                  width: 16, 
                  height: 16, 
                  color: C.textTer, 
                  marginLeft: 10,
                  flexShrink: 0,
                }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) => handleLocationInputChange(event.target.value)}
                  placeholder="Search for a location, e.g. Kilimani, Nairobi"
                  style={{
                    border: "none",
                    outline: "none",
                    padding: "8px 12px",
                    fontSize: 12,
                    fontFamily: "inherit",
                    color: C.text,
                    background: "transparent",
                    width: "100%",
                  }}
                />
                {isLoadingSuggestions && (
                  <div style={{
                    width: 16,
                    height: 16,
                    border: `2px solid ${C.border}`,
                    borderTop: `2px solid ${C.blue}`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: 10,
                  }} />
                )}
              </div>
              {errors.location && <p style={{ color: C.danger, fontSize: 10, margin: "3px 0 0" }}>{errors.location}</p>}

              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    maxHeight: 200,
                    overflowY: "auto",
                    zIndex: 1000,
                  }}
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "none",
                        borderBottom: index < suggestions.length - 1 ? `1px solid ${C.border}` : "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = C.blueTint}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: 12, color: C.text }}>{suggestion.label}</span>
                      <span style={{ fontSize: 10, color: C.textTer }}>
                        {suggestion.address?.city || suggestion.address?.town || suggestion.address?.suburb || "Kenya"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {showSuggestions && suggestions.length === 0 && searchQuery.length >= 2 && !isLoadingSuggestions && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: "12px",
                    textAlign: "center",
                    color: C.textSec,
                    fontSize: 12,
                    zIndex: 1000,
                  }}
                >
                  No locations found. Try a different search term.
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div>
            <label style={{ ...labelStyle, fontSize: 11 }}>Map</label>
            <div
              ref={mapContainerRef}
              style={{
                width: "100%",
                height: 220,
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: C.bg,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {!mapLoaded && !mapError && !form.locationLat && !selectedLocation && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: C.textSec,
                  fontSize: 12,
                  flexDirection: "column",
                  gap: 6,
                }}>
                  <MapPinIcon style={{ width: 24, height: 24, color: C.textTer }} />
                  <span>Search for a location above to see the map</span>
                </div>
              )}
              {!mapLoaded && !mapError && (form.locationLat || selectedLocation) && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: C.textSec,
                  fontSize: 12,
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    border: `2px solid ${C.border}`,
                    borderTop: `2px solid ${C.blue}`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: 10,
                  }} />
                  Loading map...
                </div>
              )}
              {mapError && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: C.danger,
                  fontSize: 12,
                  flexDirection: "column",
                  gap: 6,
                }}>
                  <span> Could not load map</span>
                  <span style={{ fontSize: 10, color: C.textSec }}>
                    Please select a location from the search above
                  </span>
                </div>
              )}
              {form.locationLat && form.locationLng && mapLoaded && (
                <div style={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  background: C.surface,
                  padding: "2px 8px",
                  borderRadius: 3,
                  fontSize: 9,
                  color: C.textSec,
                  border: `1px solid ${C.border}`,
                  pointerEvents: "none",
                }}>
                  {form.locationLat.toFixed(6)}, {form.locationLng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label style={{ ...labelStyle, fontSize: 11 }}>
              <PhotoIcon style={{ width: 14, height: 14 }} />
              Property Images
              <span style={{ fontSize: 10, color: C.textTer, fontWeight: 400, marginLeft: 6 }}>
                ({form.images.length}/{MAX_IMAGES})
              </span>
            </label>

            <div
              style={{
                border: `2px dashed ${errors.images ? C.danger : C.border}`,
                borderRadius: 6,
                padding: 16,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.15s",
                background: "#FAFAF8",
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = C.blue;
                e.currentTarget.style.background = C.blueTint;
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = "#FAFAF8";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = "#FAFAF8";
                if (e.dataTransfer.files.length > 0) {
                  handleImageUpload({ target: { files: e.dataTransfer.files } });
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <PhotoIcon style={{ width: 28, height: 28, color: C.textTer, marginBottom: 6 }} />
              <p style={{ margin: 0, fontSize: 12, color: C.text }}>
                Click or drag to upload images
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 10, color: C.textTer }}>
                PNG, JPG, WebP up to 5MB each (Max {MAX_IMAGES} images)
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 9, color: C.warning }}>
                Images will be compressed to 600x600px for faster upload
              </p>
            </div>

            {errors.images && (
              <p style={{ color: C.danger, fontSize: 10, margin: "3px 0 0" }}>{errors.images}</p>
            )}
            {imageErrors.map((err, index) => (
              <p key={index} style={{ color: C.danger, fontSize: 10, margin: "3px 0 0" }}>⚠️ {err}</p>
            ))}
            {uploadingImages && (
              <p style={{ color: C.textSec, fontSize: 10, margin: "3px 0 0" }}>
                <span style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  border: `2px solid ${C.border}`,
                  borderTop: `2px solid ${C.blue}`,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginRight: 6,
                }} />
                Uploading images...
              </p>
            )}

            {form.images.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 8,
                marginTop: 8,
              }}>
                {form.images.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      position: "relative",
                      borderRadius: 6,
                      overflow: "hidden",
                      border: image.isPrimary ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                      aspectRatio: "1",
                      background: C.bg,
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || "Property image"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {image.isPrimary && (
                      <div style={{
                        position: "absolute",
                        top: 3,
                        left: 3,
                        background: C.blue,
                        color: "#fff",
                        fontSize: 8,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: 3,
                      }}>
                        Primary
                      </div>
                    )}

                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 4,
                      background: "rgba(0,0,0,0.6)",
                      display: "flex",
                      gap: 3,
                      alignItems: "center",
                    }}>
                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#fff",
                            fontSize: 8,
                            cursor: "pointer",
                            padding: "2px 4px",
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.2)",
                          }}
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        style={{
                          marginLeft: "auto",
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          padding: "2px 4px",
                          borderRadius: 3,
                          background: "rgba(255,0,0,0.5)",
                        }}
                      >
                        <TrashIcon style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price, Type */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}>
            <div>
              <label style={{ ...labelStyle, fontSize: 11 }}>
                <CurrencyDollarIcon style={{ width: 14, height: 14 }} />
                Monthly rent (KSh)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="e.g. 18000"
                style={{
                  ...inputStyle,
                  fontSize: 12,
                  padding: "8px 12px",
                  borderColor: errors.price ? C.danger : C.borderMid,
                }}
              />
              {errors.price && <p style={{ color: C.danger, fontSize: 10, margin: "3px 0 0" }}>{errors.price}</p>}
            </div>

            <div>
              <label style={{ ...labelStyle, fontSize: 11 }}>
                <BuildingOffice2Icon style={{ width: 14, height: 14 }} />
                Property type
              </label>
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
                style={{
                  ...inputStyle,
                  fontSize: 12,
                  padding: "8px 12px",
                }}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ ...labelStyle, fontSize: 11 }}>
              <DocumentTextIcon style={{ width: 14, height: 14 }} />
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe the property, including size, features, and neighborhood..."
              style={{
                ...inputStyle,
                fontSize: 12,
                padding: "8px 12px",
                resize: "vertical",
                borderColor: errors.description ? C.danger : C.borderMid,
              }}
            />
            {errors.description && <p style={{ color: C.danger, fontSize: 10, margin: "3px 0 0" }}>{errors.description}</p>}
          </div>

          {/* Amenities */}
          <div>
            <label style={{ ...labelStyle, fontSize: 11 }}>
              Amenities
              <span style={{ fontSize: 10, color: C.textTer, fontWeight: 400, marginLeft: 6 }}>
                (Select all that apply)
              </span>
            </label>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              padding: 10,
              background: "#FAFAF8",
              borderRadius: 6,
              border: `1px solid ${C.border}`,
            }}>
              {ALL_AMENITIES.map((amenity) => {
                const selected = form.amenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    style={{
                      borderRadius: 9999,
                      border: `1px solid ${selected ? C.blue : C.border}`,
                      background: selected ? C.blueTint : "#fff",
                      color: selected ? C.blue : C.textSec,
                      padding: "4px 12px",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: selected ? 600 : 400,
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = C.blue;
                        e.currentTarget.style.background = C.blueTint;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    {selected && <span style={{ fontSize: 10 }}>✓</span>}
                    {amenity}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 4, fontSize: 10, color: C.textTer }}>
              {form.amenities.length} of {ALL_AMENITIES.length} selected
            </div>
          </div>

          {/* House Rules */}
          <div>
            <label style={{ ...labelStyle, fontSize: 11 }}>House rules</label>
            <textarea
              rows={2}
              value={form.rules}
              onChange={(event) => updateField("rules", event.target.value)}
              placeholder="e.g. No pets · No smoking · 1-month deposit"
              style={{
                ...inputStyle,
                fontSize: 12,
                padding: "8px 12px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            paddingTop: 12,
            borderTop: `1px solid ${C.border}`,
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "6px 16px",
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                background: "#fff",
                color: C.text,
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 11,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.bg}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "6px 20px",
                border: "none",
                borderRadius: 6,
                background: C.text,
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 11,
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <PlusIcon style={{ width: 14, height: 14 }} />
              Submit for review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginBottom: 4,
  fontWeight: 600,
  color: C.text,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${C.borderMid}`,
  borderRadius: 6,
  fontFamily: "inherit",
  color: C.text,
  background: "#fff",
  transition: "border-color 0.15s",
  outline: "none",
};