
import { useState } from "react";
import { Badge, C } from "./landlordTheme";

const AMENITIES = ["WiFi", "24hr water", "Caretaker", "Parking", "CCTV"];

export default function EditProperty({ property, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(property ? { ...property } : null);

  if (!form) {
    return null;
  }

  const toggleAmenity = amenity => {
    setForm(current => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter(item => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSave = event => {
    event.preventDefault();
    onSave?.(form);
    onClose?.();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, color: C.text }}>Edit property</h2>
            <p style={{ margin: "4px 0 0", color: C.textSec, fontSize: 12 }}>Update listing details and save the changes.</p>
          </div>
          <button type="button" onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <Badge variant="warning">Editing</Badge>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>Property title</label>
              <input value={form.title || ""} onChange={event => updateField("title", event.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Location</label>
              <input value={form.location || ""} onChange={event => updateField("location", event.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Monthly rent</label>
                <input type="number" value={form.price || ""} onChange={event => updateField("price", event.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Availability</label>
                <select value={form.status || "available"} onChange={event => updateField("status", event.target.value)} style={inputStyle}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="booked">Booked</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Amenities</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {AMENITIES.map(amenity => {
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
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
                    >
                      {selected ? `✓ ${amenity}` : amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={labelStyle}>House rules</label>
              <textarea rows={3} value={form.rules || ""} onChange={event => updateField("rules", event.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => onDelete?.(form.id)} style={dangerButtonStyle}>Delete listing</button>
              <button type="submit" style={primaryButtonStyle}>Save changes</button>
            </div>
          </form>
        </div>
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
  padding: 20,
};

const modalStyle = {
  width: "100%",
  maxWidth: 620,
  maxHeight: "90vh",
  overflowY: "auto",
  background: C.surface,
  borderRadius: 16,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const headerStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  padding: 20,
  borderBottom: `1px solid ${C.border}`,
};

const labelStyle = {
  display: "block",
  marginBottom: 4,
  fontSize: 12,
  color: C.textSec,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${C.borderMid}`,
  borderRadius: 10,
  padding: "10px 12px",
  font: "inherit",
  color: C.text,
  background: "#fff",
};

const closeButtonStyle = {
  border: "none",
  background: "transparent",
  color: C.textSec,
  cursor: "pointer",
  fontSize: 20,
  lineHeight: 1,
};

const primaryButtonStyle = {
  flex: 1,
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  background: C.text,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const dangerButtonStyle = {
  flex: 1,
  border: `1px solid ${C.danger}`,
  borderRadius: 10,
  padding: "10px 16px",
  background: "#fff",
  color: C.danger,
  cursor: "pointer",
  fontWeight: 600,
};
