
import { useState } from "react";
import { C } from "./landlordTheme";

const AMENITIES = ["WiFi", "24hr water", "Caretaker", "Parking", "CCTV"];

const EMPTY_FORM = {
  title: "",
  location: "",
  price: "",
  type: "Bedsitter",
  description: "",
  amenities: [],
  rules: "",
};

export default function AddProperty({ onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = event => {
    event.preventDefault();
    onSave?.(form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenTint, color: C.green, display: "grid", placeItems: "center", fontSize: 30, margin: "0 auto 16px" }}>✓</div>
          <h2 style={{ margin: "0 0 8px", color: C.text }}>Property submitted</h2>
          <p style={{ margin: "0 0 20px", color: C.textSec, lineHeight: 1.6 }}>
            Your listing has been saved and sent for review.
          </p>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: C.text, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
        <h2 style={{ margin: "0 0 6px", color: C.text }}>Add property</h2>
        <p style={{ margin: "0 0 20px", color: C.textSec }}>Create a new listing for review.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: C.textSec }}>Property title</label>
            <input value={form.title} onChange={event => updateField("title", event.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: C.textSec }}>Location</label>
            <input value={form.location} onChange={event => updateField("location", event.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: C.textSec }}>Price / month</label>
              <input type="number" value={form.price} onChange={event => updateField("price", event.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: C.textSec }}>Property type</label>
              <select value={form.type} onChange={event => updateField("type", event.target.value)} style={inputStyle}>
                {["Bedsitter", "Studio", "1BR", "2BR", "3BR", "4BR+"].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: C.textSec }}>Description</label>
            <textarea rows={4} value={form.description} onChange={event => updateField("description", event.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: C.textSec }}>Amenities</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {AMENITIES.map(amenity => {
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
            <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: C.textSec }}>House rules</label>
            <textarea rows={3} value={form.rules} onChange={event => updateField("rules", event.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onCancel} style={secondaryButtonStyle}>Cancel</button>
            <button type="submit" style={primaryButtonStyle}>Submit for review</button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

const primaryButtonStyle = {
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  background: C.text,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "10px 18px",
  background: "#fff",
  color: C.text,
  cursor: "pointer",
  fontWeight: 600,
};
