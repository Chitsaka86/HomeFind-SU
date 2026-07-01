import { useState } from "react";
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  HomeModernIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Badge, C } from "./studentUi.jsx";

function formatDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function MyBookings({ bookings = [], loading = false, error = "" }) {
  const statusMap = {
    pending: { label: "Pending", variant: "warning" },
    confirmed: { label: "Confirmed", variant: "success" },
    cancelled: { label: "Cancelled", variant: "neutral" },
    completed: { label: "Completed", variant: "info" },
    declined: { label: "Declined", variant: "neutral" },
  };

  const [tab, setTab] = useState("all");

  const filteredBookings = bookings.filter(
    (booking) =>
      tab === "all" ||
      (tab === "upcoming" && ["pending", "confirmed"].includes(booking.status)) ||
      (tab === "past" && ["cancelled", "completed", "declined"].includes(booking.status))
  );

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
        <CalendarDaysIcon style={{ width: 36, height: 36 }} />
      </div>
      <h3 style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        margin: "0 0 8px" 
      }}>
        {tab === "all" ? "No bookings yet" : tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
      </h3>
      <p style={{ 
        fontSize: 14, 
        color: C.textSec, 
        margin: 0,
        maxWidth: 400,
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        {tab === "all" 
          ? "Your booking history will appear here once you make a request." 
          : tab === "upcoming" 
          ? "You don't have any upcoming bookings scheduled." 
          : "Your completed bookings will appear here."}
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
        {/* Header */}
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
              <CalendarDaysIcon style={{ width: 24, height: 24, color: C.blue }} />
              My bookings
            </h2>
            <p style={{ 
              fontSize: 14, 
              color: C.textSec, 
              margin: "4px 0 0" 
            }}>
              Manage your viewing appointments and reservations
            </p>
          </div>
          
          {/* Tab Buttons */}
          <div style={{ 
            display: "flex", 
            gap: 4, 
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: 4,
          }}>
            {["all", "upcoming", "past"].map((value) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                style={{
                  border: "none",
                  borderRadius: 7,
                  padding: "7px 18px",
                  background: tab === value ? C.text : "transparent",
                  color: tab === value ? "#fff" : C.textSec,
                  fontSize: 12,
                  fontWeight: tab === value ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
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
                Loading bookings
              </p>
              <p style={{ fontSize: 12, margin: 0, color: C.textSec }}>
                Fetching your bookings from the database.
              </p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
              <ExclamationTriangleIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.warning, margin: "0 auto" }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>
                Could not load bookings
              </p>
              <p style={{ fontSize: 12, margin: 0, color: C.textSec }}>{error}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filteredBookings.map((booking, index) => {
                const status = statusMap[booking.status] || statusMap.pending;
                return (
                  <div
                    key={index}
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: 18,
                      background: "#FAFAF8",
                      transition: "box-shadow 0.15s",
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: 14, 
                      flexWrap: "wrap",
                    }}>
                      {/* Icon */}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: C.blueTint,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <HomeModernIcon style={{ width: 22, height: 22, color: C.blue }} />
                      </div>
                      
                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 10,
                          flexWrap: "wrap",
                          marginBottom: 4,
                        }}>
                          <span style={{ 
                            fontSize: 15, 
                            fontWeight: 700, 
                            color: C.text 
                          }}>
                            {booking.property || "Property"}
                          </span>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </div>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 16,
                          flexWrap: "wrap",
                          color: C.textSec,
                          fontSize: 13,
                        }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MapPinIcon style={{ width: 14, height: 14 }} />
                            {booking.type || "Unit"}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <CalendarDaysIcon style={{ width: 14, height: 14 }} />
                            {formatDate(booking.date) || "Date TBD"}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <ClockIcon style={{ width: 14, height: 14 }} />
                            {booking.time || "Time TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {booking.status !== "cancelled" && booking.status !== "declined" && (
                        <div style={{ 
                          display: "flex", 
                          gap: 8, 
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}>
                          <button 
                            style={{ 
                              border: `1px solid ${C.border}`,
                              background: "#fff",
                              borderRadius: 7,
                              height: 34,
                              padding: "0 16px",
                              fontSize: 12,
                              cursor: "pointer",
                              color: C.text,
                              fontWeight: 500,
                              transition: "all 0.15s",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = C.blueTint}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                          >
                            View property
                            <ChevronRightIcon style={{ width: 14, height: 14 }} />
                          </button>
                          {booking.status === "confirmed" && (
                            <button 
                              style={{
                                background: C.greenTint,
                                border: `1px solid ${C.greenBorder}`,
                                borderRadius: 7,
                                height: 34,
                                padding: "0 16px",
                                fontSize: 12,
                                cursor: "pointer",
                                color: C.green,
                                fontWeight: 600,
                              }}
                            >
                              Leave review
                            </button>
                          )}
                          {booking.status === "pending" && (
                            <button 
                              style={{
                                background: "#fff",
                                border: `1px solid ${C.danger}`,
                                borderRadius: 7,
                                height: 34,
                                padding: "0 16px",
                                fontSize: 12,
                                cursor: "pointer",
                                color: C.danger,
                                fontWeight: 500,
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = C.dangerTint}
                              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}