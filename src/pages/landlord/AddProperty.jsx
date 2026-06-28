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
} from "@heroicons/react/24/outline";

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


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


const STATUS_OPTIONS = ["available", "booked", "pending"];

const EMPTY_FORM = {
  title: "",
  location: "",
  locationLat: null,
  locationLng: null,
  price: "",
  type: "Bedsitter",
  status: "available",
  description: "",
  amenities: [],
  rules: "",
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
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  
  useEffect(() => {
    
    if (!selectedLocation && !form.locationLat) return;

    const initMap = () => {
      try {
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markerRef.current = null;
        }

        const lat = form.locationLat || selectedLocation?.lat || -1.2864;
        const lng = form.locationLng || selectedLocation?.lon || 36.8172;

      
        mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        
        markerRef.current = L.marker([lat, lng], {
          draggable: true,
        }).addTo(mapInstanceRef.current);

        
        markerRef.current.on('dragend', function() {
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
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError(true);
      }
    };

    
    const timer = setTimeout(initMap, 100);

    
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [form.locationLat, form.locationLng, selectedLocation]);

  
  useEffect(() => {
    if (mapInstanceRef.current && form.locationLat && form.locationLng) {
      mapInstanceRef.current.setView([form.locationLat, form.locationLng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([form.locationLat, form.locationLng]);
      }
    }
  }, [form.locationLat, form.locationLng]);

  
  const searchLocations = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(query)}&countrycodes=ke`,
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
    debounce((query) => searchLocations(query), 400),
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    onSave?.(form);
    setSubmitted(true);
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
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <div style={{ 
          background: C.surface, 
          border: `1px solid ${C.border}`, 
          borderRadius: 14, 
          padding: 40, 
          textAlign: "center" 
        }}>
          <div style={{ 
            width: 72, 
            height: 72, 
            borderRadius: "50%", 
            background: C.greenTint, 
            color: C.green, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 16px", 
            fontSize: 36 
          }}>
            ✓
          </div>
          <h2 style={{ margin: "0 0 8px", color: C.text }}>Property submitted</h2>
          <p style={{ margin: "0 0 8px", color: C.textSec, lineHeight: 1.6 }}>
            Your listing has been saved and sent for review.
          </p>
          <p style={{ margin: "0 0 24px", color: C.textTer, fontSize: 13 }}>
            We'll notify you once it's approved.
          </p>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: C.text,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ 
        background: C.surface, 
        border: `1px solid ${C.border}`, 
        borderRadius: 16, 
        padding: 28,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>Add property</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSec }}>Create a new listing for review</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "none",
              color: C.textSec,
              cursor: "pointer",
              padding: 8,
            }}
          >
            <XMarkIcon style={{ width: 24, height: 24 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>
              <HomeModernIcon style={{ width: 16, height: 16 }} />
              Property title
            </label>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. Kilimani View Apartment"
              style={{
                ...inputStyle,
                borderColor: errors.title ? C.danger : C.borderMid,
              }}
            />
            {errors.title && <p style={{ color: C.danger, fontSize: 11, margin: "4px 0 0" }}>{errors.title}</p>}
          </div>

          {/* Location with Autocomplete */}
          <div>
            <label style={labelStyle}>
              <MapPinIcon style={{ width: 16, height: 16 }} />
              Location
            </label>
            <div style={{ position: "relative" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${errors.location ? C.danger : C.borderMid}`,
                borderRadius: 8,
                background: "#fff",
                transition: "border-color 0.15s",
              }}>
                <MagnifyingGlassIcon style={{ 
                  width: 18, 
                  height: 18, 
                  color: C.textTer, 
                  marginLeft: 12,
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
                    padding: "10px 14px",
                    fontSize: 13,
                    fontFamily: "inherit",
                    color: C.text,
                    background: "transparent",
                    width: "100%",
                  }}
                />
                {isLoadingSuggestions && (
                  <div style={{
                    width: 20,
                    height: 20,
                    border: `2px solid ${C.border}`,
                    borderTop: `2px solid ${C.blue}`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: 12,
                  }} />
                )}
              </div>
              {errors.location && <p style={{ color: C.danger, fontSize: 11, margin: "4px 0 0" }}>{errors.location}</p>}

              {/* Suggestions Dropdown */}
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
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    maxHeight: 280,
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
                        padding: "10px 14px",
                        border: "none",
                        borderBottom: index < suggestions.length - 1 ? `1px solid ${C.border}` : "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = C.blueTint}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: 13, color: C.text }}>{suggestion.label}</span>
                      <span style={{ fontSize: 11, color: C.textTer }}>
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
                    borderRadius: 8,
                    padding: "16px",
                    textAlign: "center",
                    color: C.textSec,
                    fontSize: 13,
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
            <label style={labelStyle}>Map</label>
            <div
              ref={mapContainerRef}
              style={{
                width: "100%",
                height: 280,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.bg,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {!mapLoaded && !mapError && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: C.textSec,
                  fontSize: 13,
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    border: `2px solid ${C.border}`,
                    borderTop: `2px solid ${C.blue}`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: 12,
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
                  fontSize: 13,
                  flexDirection: "column",
                  gap: 8,
                }}>
                  <span> Could not load map</span>
                  <span style={{ fontSize: 11, color: C.textSec }}>
                    Please select a location from the search above
                  </span>
                </div>
              )}
              {form.locationLat && form.locationLng && mapLoaded && (
                <div style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  background: C.surface,
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontSize: 10,
                  color: C.textSec,
                  border: `1px solid ${C.border}`,
                  pointerEvents: "none",
                }}>
                   {form.locationLat.toFixed(6)}, {form.locationLng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* Price, Type, Status */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr 1fr", 
            gap: 16,
          }}>
            <div>
              <label style={labelStyle}>
                <CurrencyDollarIcon style={{ width: 16, height: 16 }} />
                Monthly rent (KSh)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="e.g. 18000"
                style={{
                  ...inputStyle,
                  borderColor: errors.price ? C.danger : C.borderMid,
                }}
              />
              {errors.price && <p style={{ color: C.danger, fontSize: 11, margin: "4px 0 0" }}>{errors.price}</p>}
            </div>

            <div>
              <label style={labelStyle}>
                <BuildingOffice2Icon style={{ width: 16, height: 16 }} />
                Property type
              </label>
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
                style={inputStyle}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                style={inputStyle}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>
              <DocumentTextIcon style={{ width: 16, height: 16 }} />
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe the property, including size, features, and neighborhood..."
              style={{
                ...inputStyle,
                resize: "vertical",
                borderColor: errors.description ? C.danger : C.borderMid,
              }}
            />
            {errors.description && <p style={{ color: C.danger, fontSize: 11, margin: "4px 0 0" }}>{errors.description}</p>}
          </div>

          {/* Amenities */}
          <div>
            <label style={labelStyle}>
              Amenities
              <span style={{ fontSize: 11, color: C.textTer, fontWeight: 400, marginLeft: 8 }}>
                (Select all that apply)
              </span>
            </label>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              padding: 12,
              background: "#FAFAF8",
              borderRadius: 8,
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
                      padding: "6px 14px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: selected ? 600 : 400,
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
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
                    {selected && <span style={{ fontSize: 12 }}>✓</span>}
                    {amenity}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: C.textTer }}>
              {form.amenities.length} of {ALL_AMENITIES.length} selected
            </div>
          </div>

          {/* House Rules */}
          <div>
            <label style={labelStyle}>House rules</label>
            <textarea
              rows={3}
              value={form.rules}
              onChange={(event) => updateField("rules", event.target.value)}
              placeholder="e.g. No pets · No smoking · 1-month deposit"
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            paddingTop: 16,
            borderTop: `1px solid ${C.border}`,
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "10px 24px",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                background: "#fff",
                color: C.text,
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 13,
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
                padding: "10px 32px",
                border: "none",
                borderRadius: 8,
                background: C.text,
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <PlusIcon style={{ width: 16, height: 16 }} />
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
  gap: 6,
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: C.text,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${C.borderMid}`,
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 13,
  fontFamily: "inherit",
  color: C.text,
  background: "#fff",
  transition: "border-color 0.15s",
  outline: "none",
};