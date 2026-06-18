import { C } from "./studentUi.jsx";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";

export default function SavedProperties({ onView, savedProperties = [], loading = false, error = "" }) {
  return (
    <div style={{ width: "100%", minHeight: "calc(100vh - 52px)", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 24, boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 760 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: "0 0 16px" }}>Saved properties</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
          <ArrowPathIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.textSec, animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>Loading saved properties</p>
          <p style={{ fontSize: 12, margin: 0 }}>Fetching your saved properties from the database.</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
          <ExclamationTriangleIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.warning }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>Could not load saved properties</p>
          <p style={{ fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      ) : savedProperties.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
          <HeartIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.danger }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>No saved properties yet</p>
          <p style={{ fontSize: 12, margin: 0 }}>Save properties you like and they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {savedProperties.slice(0, 3).map((property) => (
          <div key={property.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.surface }}>
            <div style={{ height: 90, background: "linear-gradient(135deg,#E6F1FB,#C8DFF5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>
              <HomeModernIcon style={{ width: 28, height: 28, color: C.blue }} />
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{property.title}</span>
                <HeartIcon style={{ width: 16, height: 16, color: C.danger, cursor: "pointer" }} />
              </div>
              <p style={{ fontSize: 10, color: C.textSec, margin: "0 0 6px" }}>KSh {property.price.toLocaleString()}/mo</p>
              <button
                onClick={() => onView(property)}
                style={{
                  width: "100%",
                  background: C.text,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  height: 28,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View details
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
      </div>
    </div>
  );
}
