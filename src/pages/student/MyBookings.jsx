import { useState } from "react";
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  HomeModernIcon,
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
  };

  const [tab, setTab] = useState("all");

  const filteredBookings = bookings.filter(
    (booking) =>
      tab === "all" ||
      (tab === "upcoming" && ["pending", "confirmed"].includes(booking.status)) ||
      (tab === "past" && booking.status === "cancelled")
  );

  return (
    <div style={{ width: "100%", minHeight: "calc(100vh - 52px)", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 24, boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>My bookings</h2>
        <div style={{ display: "flex", gap: 4 }}>
          {["all", "upcoming", "past"].map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              style={{
                background: tab === value ? C.blueTint : "transparent",
                color: tab === value ? C.blue : C.textSec,
                border: `1px solid ${tab === value ? C.blue : C.border}`,
                borderRadius: 6,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: tab === value ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
          <ArrowPathIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.textSec, animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>Loading bookings</p>
          <p style={{ fontSize: 12, margin: 0 }}>Fetching your bookings from the database.</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
          <ExclamationTriangleIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.warning }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>Could not load bookings</p>
          <p style={{ fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textSec }}>
          <CalendarDaysIcon style={{ width: 40, height: 40, marginBottom: 12, color: C.textSec }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: C.text }}>No bookings yet</p>
          <p style={{ fontSize: 12, margin: 0 }}>Your booking history will appear here once you make a request.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredBookings.map((booking, index) => (
          <div
            key={index}
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: 14,
              background: C.surface,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: C.blueTint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                <HomeModernIcon style={{ width: 22, height: 22, color: C.blue }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 2px", color: C.text }}>{booking.property}</p>
                <p style={{ fontSize: 11, color: C.textSec, margin: 0 }}>
                    {booking.type} · {formatDate(booking.date)} · {booking.time}
                </p>
              </div>
              <Badge variant={statusMap[booking.status].variant}>{statusMap[booking.status].label}</Badge>
            </div>

            {booking.status !== "cancelled" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, border: `1px solid ${C.border}`, background: "#fff", borderRadius: 7, height: 32, fontSize: 12, cursor: "pointer", color: C.text }}>
                  View property
                </button>
                {booking.status === "confirmed" && (
                  <button style={{ flex: 1, background: C.greenTint, border: `1px solid ${C.greenBorder}`, borderRadius: 7, height: 32, fontSize: 12, cursor: "pointer", color: C.green, fontWeight: 600 }}>
                    Leave review
                  </button>
                )}
                {booking.status === "pending" && (
                  <button style={{ flex: 1, background: "#fff", border: `1px solid ${C.danger}`, borderRadius: 7, height: 32, fontSize: 12, cursor: "pointer", color: C.danger }}>
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
