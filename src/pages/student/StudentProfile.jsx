import { Badge, C } from "./studentUi.jsx";
import {
  BellIcon,
  CalendarDaysIcon,
  HeartIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function StudentProfile({ setPage, student = null, loading = false, error = "" }) {
 
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  
  
  const fullName = student?.fullName || userData.name || "Student";
  const email = student?.email || userData.email || "";
  const phone = student?.phone || "";
  
  const initials = fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

 
  const handleSignOut = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div style={{ width: "100%", minHeight: "calc(100vh - 52px)", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 24, boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "24px 20px 20px", textAlign: "center", borderBottom: `1px solid ${C.border}`, background: "#FAFAF8" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.blueTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 20, fontWeight: 700, color: C.blue }}>
              {initials}
            </div>
            
            {loading ? (
              <>
                <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 3px", color: C.text }}>Loading profile</p>
                <p style={{ fontSize: 12, color: C.textSec, margin: "0 0 10px" }}>Fetching student information</p>
              </>
            ) : error ? (
              <>
                <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 3px", color: C.text }}>Could not load profile</p>
                <p style={{ fontSize: 12, color: C.textSec, margin: "0 0 10px" }}>{error}</p>
                {email && (
                  <p style={{ fontSize: 12, color: C.textSec, margin: "0 0 10px" }}>
                    <strong>Email:</strong> {email}
                  </p>
                )}
              </>
            ) : (
              <>
                <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 3px", color: C.text }}>{fullName}</p>
                <p style={{ fontSize: 12, color: C.textSec, margin: "0 0 4px" }}>{email}</p>
                {phone && <p style={{ fontSize: 12, color: C.textSec, margin: "0 0 10px" }}>{phone}</p>}
              </>
            )}
            <Badge variant="info">Student</Badge>
          </div>

          {[
            { icon: <UserCircleIcon style={{ width: 18, height: 18 }} />, label: "Personal info", action: null },
            { icon: <CalendarDaysIcon style={{ width: 18, height: 18 }} />, label: "My bookings", action: () => setPage("bookings") },
            { icon: <HeartIcon style={{ width: 18, height: 18 }} />, label: "Saved properties", action: () => setPage("saved") },
            { icon: <BellIcon style={{ width: 18, height: 18 }} />, label: "Notifications", action: null },
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 20px",
                background: "none",
                border: "none",
                borderBottom: `1px solid ${C.border}`,
                cursor: item.action ? "pointer" : "default",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: C.textSec }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: C.text }}>{item.label}</span>
              </div>
              {item.action && <span style={{ color: C.textTer }}>›</span>}
            </button>
          ))}

          <button 
            onClick={handleSignOut}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 20px", background: "none", border: "none", cursor: "pointer" }}
          >
            <ArrowRightOnRectangleIcon style={{ width: 18, height: 18, color: C.danger }} />
            <span style={{ fontSize: 13, color: C.danger, fontWeight: 600 }}>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}