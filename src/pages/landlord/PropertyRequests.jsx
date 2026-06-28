import { useMemo, useState } from "react";
import { Badge, C } from "./landlordTheme";
import {
  CalendarIcon,
  ClockIcon,
  HomeModernIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function PropertyRequests({ bookings = [], onUpdate }) {
  const [tab, setTab] = useState("all");

  const filteredBookings = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) {
      return [];
    }
    
    return bookings.filter(booking => {
      if (tab === "all") {
        return true;
      }
      if (tab === "pending") {
        return booking.status === "pending";
      }
      return ["confirmed", "declined", "completed"].includes(booking.status);
    });
  }, [bookings, tab]);

  const statusConfig = {
    pending: { 
      label: "Pending", 
      variant: "pending",
      icon: <ClockIcon style={{ width: 14, height: 14 }} />,
      color: C.warning,
      bg: C.warnTint,
    },
    confirmed: { 
      label: "Confirmed", 
      variant: "success",
      icon: <CheckCircleIcon style={{ width: 14, height: 14 }} />,
      color: C.green,
      bg: C.greenTint,
    },
    declined: { 
      label: "Declined", 
      variant: "neutral",
      icon: <XCircleIcon style={{ width: 14, height: 14 }} />,
      color: C.textSec,
      bg: "#F0F0E8",
    },
    completed: { 
      label: "Completed", 
      variant: "info",
      icon: <CheckCircleIcon style={{ width: 14, height: 14 }} />,
      color: C.blue,
      bg: C.blueTint,
    },
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 14px",
        borderRadius: 9999,
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        border: `1px solid ${config.color}20`,
      }}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const EmptyState = () => (
    <div style={{
      textAlign: "center",
      padding: "64px 20px",
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
        <CalendarIcon style={{ width: 36, height: 36 }} />
      </div>
      <h3 style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: C.text, 
        margin: "0 0 8px" 
      }}>
        {tab === "all" 
          ? "No property requests" 
          : tab === "pending" 
          ? "No pending requests" 
          : "No completed requests"}
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
          ? "When students request to view your properties, they'll appear here." 
          : tab === "pending" 
          ? "All pending requests will show up here once students make them." 
          : "Completed requests will appear here once you mark them as done."}
      </p>
    </div>
  );

  return (
    <div style={{ 
      maxWidth: 820, 
      margin: "0 auto",
      padding: "0 4px",
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        gap: 16, 
        marginBottom: 24,
        flexWrap: "wrap",
      }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: 20, 
            fontWeight: 700, 
            color: C.text 
          }}>
            Property requests
          </h2>
          <p style={{ 
            margin: "4px 0 0", 
            fontSize: 14, 
            color: C.textSec 
          }}>
            Manage booking requests and site visits
          </p>
        </div>

        <div style={{ 
          display: "flex", 
          gap: 4, 
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: 4,
        }}>
          {["all", "pending", "done"].map(value => (
            <button
              type="button"
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
        minHeight: 200,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {filteredBookings.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filteredBookings.map(booking => {
              const status = statusConfig[booking.status] || statusConfig.pending;
              const isPending = booking.status === "pending";
              const isConfirmed = booking.status === "confirmed";
              
              return (
                <div 
                  key={booking.id} 
                  style={{
                    border: `1px solid ${isPending ? C.warnBorder : C.border}`,
                    borderRadius: 12,
                    padding: 20,
                    background: isPending ? `${C.warnTint}80` : "#FAFAF8",
                    transition: "all 0.2s ease",
                    boxShadow: isPending ? "0 2px 8px rgba(186, 117, 23, 0.06)" : "none",
                  }}
                >
                  {/* Header Row */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "flex-start", 
                    gap: 14, 
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}>
                    <div style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: status.bg,
                      color: status.color,
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                      border: `2px solid ${status.color}30`,
                    }}>
                      {booking.initials || <UserIcon style={{ width: 20, height: 20 }} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 10,
                        flexWrap: "wrap",
                        marginBottom: 4,
                      }}>
                        <span style={{ 
                          fontWeight: 700, 
                          fontSize: 15, 
                          color: C.text 
                        }}>
                          {booking.student || "Student"}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 18,
                        flexWrap: "wrap",
                        color: C.textSec,
                        fontSize: 13,
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <HomeModernIcon style={{ width: 14, height: 14 }} />
                          {booking.property || "Property"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <CalendarIcon style={{ width: 14, height: 14 }} />
                          {booking.date || "Date TBD"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <ClockIcon style={{ width: 14, height: 14 }} />
                          {booking.time || "Time TBD"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  {booking.note && (
                    <div style={{
                      margin: "0 0 14px 60px",
                      padding: "12px 16px",
                      background: C.surface,
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                      fontSize: 13,
                      color: C.textSec,
                      fontStyle: "italic",
                      lineHeight: 1.5,
                    }}>
                      "{booking.note}"
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isPending ? (
                    <div style={{ 
                      display: "flex", 
                      gap: 10, 
                      marginLeft: 60,
                      flexWrap: "wrap",
                    }}>
                      <button
                        type="button"
                        onClick={() => onUpdate?.(booking.id, "confirmed")}
                        style={{
                          flex: 1,
                          minWidth: 100,
                          border: "none",
                          borderRadius: 8,
                          padding: "10px 20px",
                          background: C.green,
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 13,
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 109, 17, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <CheckCircleIcon style={{ width: 16, height: 16 }} />
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate?.(booking.id, "declined")}
                        style={{
                          flex: 1,
                          minWidth: 100,
                          border: `1px solid ${C.danger}`,
                          borderRadius: 8,
                          padding: "10px 20px",
                          background: "#fff",
                          color: C.danger,
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 13,
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.dangerTint;
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <XCircleIcon style={{ width: 16, height: 16 }} />
                        Decline
                      </button>
                    </div>
                  ) : isConfirmed ? (
                    <div style={{ marginLeft: 60 }}>
                      <button
                        type="button"
                        onClick={() => onUpdate?.(booking.id, "completed")}
                        style={{
                          width: "100%",
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          padding: "10px 20px",
                          background: "#fff",
                          color: C.text,
                          cursor: "pointer",
                          fontWeight: 500,
                          fontSize: 13,
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.blueTint;
                          e.currentTarget.style.borderColor = C.blue;
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.borderColor = C.border;
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <CheckCircleIcon style={{ width: 16, height: 16 }} />
                        Mark as completed
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}