import { useState, useEffect } from "react";
import { Badge, C } from "./landlordTheme";
import {
  XMarkIcon,
  PlusIcon,
  HomeModernIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const AMENITIES = ["WiFi", "24hr water", "Caretaker", "Parking", "CCTV", "Backup power", "Laundry area", "Balcony", "Furnished rooms", "Elevator", "Gym", "Swimming pool"];
const PROPERTY_TYPES = ["Bedsitter", "Studio", "1BR", "2BR", "3BR", "4BR+"];

export default function EditProperty({ property, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (property) {
      setForm({
        ...property,
        amenities: property.amenities || [],
        images: property.images || [],
        rules: property.rules || '',
        description: property.description || '',
      });
    }
  }, [property]);

  if (!form) {
    return null;
  }

  const toggleAmenity = (amenity) => {
    setForm(current => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter(item => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    if (error) setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await onSave?.(form);
      setSuccess(true);
      setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

 
  const handleDelete = async () => {
    
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    setError("");
    
    try {
      console.log(`Deleting property ${form.id} from EditProperty...`);
      
      
      if (onDelete) {
        await onDelete(form.id);
      }
      
      
      
    } catch (err) {
      console.error(' Error in delete:', err);
      setError(err.message || "Failed to delete property");
      setIsDeleting(false);
    }
  };

  const handleRemoveImage = (imageId) => {
    setForm(current => ({
      ...current,
      images: current.images.filter(img => img.id !== imageId),
    }));
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Edit property</h2>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textSec }}>Update listing details and save the changes</p>
          </div>
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Status Badge - Shows current status but not editable */}
        <div style={{ padding: "0 20px", marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
          <Badge variant="warning">Editing</Badge>
          <span style={{ fontSize: 11, color: C.textSec }}>Status: </span>
          <Badge variant={form.status === "pending" ? "pending" : form.status === "booked" ? "info" : "success"}>
            {form.status ? form.status.charAt(0).toUpperCase() + form.status.slice(1) : "Pending"}
          </Badge>
          <span style={{ fontSize: 10, color: C.textTer, marginLeft: "auto" }}>
            Status cannot be changed
          </span>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            margin: "12px 20px 0",
            padding: "10px 14px",
            background: C.greenTint,
            border: `1px solid ${C.greenBorder}`,
            borderRadius: 6,
            color: C.green,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            Property updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            margin: "12px 20px 0",
            padding: "10px 14px",
            background: C.dangerTint,
            border: `1px solid ${C.danger}`,
            borderRadius: 6,
            color: C.danger,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
             {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ padding: 16, display: "grid", gap: 14 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>
              <HomeModernIcon style={{ width: 14, height: 14 }} />
              Property title
            </label>
            <input
              value={form.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              style={inputStyle}
              placeholder="Enter property title"
            />
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>
              <MapPinIcon style={{ width: 14, height: 14 }} />
              Location
            </label>
            <input
              value={form.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
              style={inputStyle}
              placeholder="Enter property location"
            />
          </div>

          {/* Images Section */}
          <div>
            <label style={labelStyle}>
              <PhotoIcon style={{ width: 14, height: 14 }} />
              Images
              <span style={{ fontSize: 10, color: C.textTer, fontWeight: 400, marginLeft: 6 }}>
                ({form.images?.length || 0})
              </span>
            </label>
            
            {form.images && form.images.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: 8,
                marginBottom: 8,
              }}>
                {form.images.map((image) => {
                  const imageUrl = image.url || image.image_data || '';
                  const isValidImage = imageUrl && (
                    imageUrl.startsWith('data:image/') || 
                    imageUrl.startsWith('http://') || 
                    imageUrl.startsWith('https://')
                  );
                  
                  return (
                    <div key={image.id || Math.random()} style={{
                      position: "relative",
                      borderRadius: 6,
                      overflow: "hidden",
                      aspectRatio: "1",
                      background: C.bg,
                      border: image.isPrimary ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                    }}>
                      {isValidImage ? (
                        <img
                          src={imageUrl}
                          alt={image.caption || "Property image"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            console.error('Image failed to load in Edit:', imageUrl);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:${C.textSec};font-size:10px;">No image</div>`;
                          }}
                        />
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          color: C.textSec,
                          fontSize: 10,
                        }}>
                          No image
                        </div>
                      )}
                      {image.isPrimary && (
                        <div style={{
                          position: "absolute",
                          top: 2,
                          left: 2,
                          background: C.blue,
                          color: "#fff",
                          fontSize: 7,
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: 3,
                        }}>
                          Primary
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          background: "rgba(0,0,0,0.6)",
                          border: "none",
                          borderRadius: 3,
                          color: "#fff",
                          cursor: "pointer",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <TrashIcon style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: "12px",
                textAlign: "center",
                background: "#FAFAF8",
                borderRadius: 6,
                border: `1px dashed ${C.border}`,
                fontSize: 11,
                color: C.textSec,
              }}>
                No images uploaded
              </div>
            )}
          </div>

          {/* Price and Type */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}>
            <div>
              <label style={labelStyle}>
                <CurrencyDollarIcon style={{ width: 14, height: 14 }} />
                Monthly rent (KSh)
              </label>
              <input
                type="number"
                value={form.price || ""}
                onChange={(e) => updateField("price", e.target.value)}
                style={inputStyle}
                placeholder="Enter rent amount"
              />
            </div>
            <div>
              <label style={labelStyle}>
                <BuildingOffice2Icon style={{ width: 14, height: 14 }} />
                Property type
              </label>
              <select
                value={form.type || "Bedsitter"}
                onChange={(e) => updateField("type", e.target.value)}
                style={inputStyle}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>
              <DocumentTextIcon style={{ width: 14, height: 14 }} />
              Description
            </label>
            <textarea
              rows={3}
              value={form.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Describe the property..."
            />
          </div>

          {/* Amenities */}
          <div>
            <label style={labelStyle}>
              Amenities
              <span style={{ fontSize: 10, color: C.textTer, fontWeight: 400, marginLeft: 6 }}>
                ({form.amenities?.length || 0} selected)
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
              {AMENITIES.map((amenity) => {
                const selected = (form.amenities || []).includes(amenity);
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
                  >
                    {selected && <span style={{ fontSize: 10 }}>✓</span>}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* House Rules */}
          <div>
            <label style={labelStyle}>House rules</label>
            <textarea
              rows={2}
              value={form.rules || ""}
              onChange={(e) => updateField("rules", e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="e.g. No pets · No smoking · 1-month deposit"
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
              onClick={handleDelete}
              style={dangerButtonStyle}
              disabled={isDeleting || loading}
            >
              {isDeleting ? "Deleting..." : "Delete listing"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={secondaryButtonStyle}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={primaryButtonStyle}
              disabled={loading || isDeleting}
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 1000,
  display: "grid",
  placeItems: "center",
  padding: 16,
};

const modalStyle = {
  width: "100%",
  maxWidth: 520,
  maxHeight: "90vh",
  overflowY: "auto",
  background: C.surface,
  borderRadius: 12,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const headerStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
  padding: "16px 20px",
  borderBottom: `1px solid ${C.border}`,
};

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginBottom: 4,
  fontSize: 11,
  fontWeight: 600,
  color: C.text,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${C.borderMid}`,
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 12,
  fontFamily: "inherit",
  color: C.text,
  background: "#fff",
  transition: "border-color 0.15s",
  outline: "none",
};

const closeButtonStyle = {
  border: "none",
  background: "transparent",
  color: C.textSec,
  cursor: "pointer",
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const primaryButtonStyle = {
  flex: 1,
  border: "none",
  borderRadius: 6,
  padding: "8px 16px",
  background: C.text,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 11,
  transition: "opacity 0.15s",
};

const secondaryButtonStyle = {
  padding: "8px 16px",
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  background: "#fff",
  color: C.text,
  cursor: "pointer",
  fontWeight: 500,
  fontSize: 11,
  transition: "all 0.15s",
};

const dangerButtonStyle = {
  padding: "8px 16px",
  border: `1px solid ${C.danger}`,
  borderRadius: 6,
  background: "#fff",
  color: C.danger,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 11,
  transition: "all 0.15s",
};