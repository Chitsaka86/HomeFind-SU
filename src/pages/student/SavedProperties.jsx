import { useState } from "react";
import { C } from "./studentUi.jsx";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  HomeModernIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { unsaveProperty } from "../../services/savedPropertiesService.js";

export default function SavedProperties({ onView, savedProperties = [], loading = false, error = "", onRefresh }) {
  const [unsaving, setUnsaaving] = useState({});

  const handleUnsave = async (propertyId, e) => {
    e.stopPropagation();
    setUnsaaving(prev => ({ ...prev, [propertyId]: true }));
    try {
      await unsaveProperty(propertyId);
      
      onRefresh?.();
    } catch (error) {
      console.error('Error unsaving property:', error);
      alert('Failed to remove from saved. Please try again.');
    } finally {
      setUnsaaving(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  const EmptyState = () => (
    <div style={{
      textAlign: "center",
      padding: "60px 20px",
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: C.blueTint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        color: C.blue,
      }}>
        <HeartIcon style={{ width: 36, height: 36 }} />
      </div>
      <h3 style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        margin: "0 0 8px" 
      }}>
        No saved properties
      </h3>
      <p style={{ 
        fontSize: 14, 
        color: C.textSec, 
        margin: 0,
        maxWidth: 400,
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        Save properties you like by clicking the heart icon on any property card.
      </p>
    </div>
  );

  return (
    <div style={{ 
      width: "100%", 
      minHeight: "calc(100vh - 52px)", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "flex-start", 
      padding: 24, 
      boxSizing: "border-box" 
    }}>
      <div style={{ width: "100%", maxWidth: 820 }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            <h2 style={{ 
              fontSize: 20, 
              fontWeight: 700, 
              color: C.text, 
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <HeartIcon style={{ width: 24, height: 24, color: C.danger }} />
              Saved properties
            </h2>
            <p style={{ 
              fontSize: 14, 
              color: C.textSec, 
              margin: "4px 0 0" 
            }}>
              Properties you've saved for later reference
            </p>
          </div>
          
          {savedProperties.length > 0 && (
            <div style={{
              background: C.blueTint,
              color: C.blue,
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
            }}>
              {savedProperties.length} {savedProperties.length === 1 ? "property" : "properties"}
            </div>
          )}
        </div>

        <div style={{ 
          background: C.surface, 
          border: `1px solid ${C.border}`, 
          borderRadius: 16, 
          padding: 24,
          minHeight: 300,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
              <div style={{
                width: 32,
                height: 32,
                border: `3px solid ${C.border}`,
                borderTop: `3px solid ${C.blue}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px",
              }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>
                Loading saved properties
              </p>
              <p style={{ fontSize: 12, margin: 0, color: C.textSec }}>
                Fetching your saved properties from the database.
              </p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
              <ExclamationTriangleIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.warning, margin: "0 auto" }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>
                Could not load saved properties
              </p>
              <p style={{ fontSize: 12, margin: 0, color: C.textSec }}>{error}</p>
            </div>
          ) : savedProperties.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
              gap: 16 
            }}>
              {savedProperties.map((property) => (
                <div 
                  key={property.id} 
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#FAFAF8",
                    transition: "box-shadow 0.15s",
                    cursor: "pointer",
                  }}
                  onClick={() => onView(property)}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{
                    height: 130,
                    background: "linear-gradient(135deg, #E6F1FB 0%, #D0E8F8 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}>
                    <HomeModernIcon style={{ width: 34, height: 34, color: C.blue }} />
                    {/* Unsave Button */}
                    <button
                      onClick={(e) => handleUnsave(property.id, e)}
                      disabled={unsaving[property.id]}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: C.surface,
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <HeartIcon style={{ 
                        width: 16, 
                        height: 16, 
                        color: C.danger, 
                        fill: C.danger 
                      }} />
                    </button>
                  </div>

                  <div style={{ padding: "14px 16px 16px" }}>
                    <h4 style={{ 
                      fontSize: 14, 
                      fontWeight: 700, 
                      margin: "0 0 4px", 
                      color: C.text,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {property.title || "Property"}
                    </h4>
                    
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 4,
                      color: C.textSec,
                      fontSize: 12,
                      marginBottom: 6,
                    }}>
                      <MapPinIcon style={{ width: 12, height: 12 }} />
                      <span style={{ 
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {property.location || "Location"}
                      </span>
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: C.text,
                      fontSize: 16,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}>
                      <CurrencyDollarIcon style={{ width: 14, height: 14, color: C.textSec }} />
                      KSh {property.price?.toLocaleString() || "N/A"}
                      <span style={{ fontSize: 11, fontWeight: 400, color: C.textSec }}>/mo</span>
                    </div>

                    <button
                      onClick={() => onView(property)}
                      style={{
                        width: "100%",
                        background: C.text,
                        color: "#fff",
                        border: "none",
                        borderRadius: 7,
                        padding: "8px 0",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      View details
                      <ChevronRightIcon style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}