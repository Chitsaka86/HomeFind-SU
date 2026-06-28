import { useEffect, useMemo, useState } from "react";
import {
  UserCircleIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import AddProperty from "./AddProperty";
import EditProperty from "./EditProperty";
import PropertyRequests from "./PropertyRequests";
import { Badge, C } from "./landlordTheme";
import { fetchLandlordDashboard } from "../../services/landlordDashboardService";

function StatCard({ label, value, icon, tone = "text" }) {
  const colors = {
    text: { bg: C.blueTint, color: C.blue },
    warning: { bg: C.warnTint, color: C.warning },
    green: { bg: C.greenTint, color: C.green },
  };

  return (
    <div style={{ 
      background: C.surface, 
      border: `1px solid ${C.border}`, 
      borderRadius: 14, 
      padding: 20,
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: colors[tone]?.bg || C.blueTint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colors[tone]?.color || C.blue,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: C.textSec }}>{label}</p>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.text }}>{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "60px 20px",
      color: C.textSec,
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: C.blueTint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
        color: C.blue,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 14, margin: "0 0 20px", color: C.textSec }}>{description}</p>
      {action}
    </div>
  );
}

function LandlordDashboard() {
  const [page, setPage] = useState("dashboard");
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [landlord, setLandlord] = useState(null);
  const [stats, setStats] = useState({ totalProperties: 0, pendingApprovals: 0, confirmedBookings: 0 });
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('📧 Loading landlord dashboard for:', userData.email);
        
        if (!userData.email) {
          setError("No email found. Please log in again.");
          setLoading(false);
          return;
        }
        
        const data = await fetchLandlordDashboard(userData.email);

        if (!isMounted) {
          return;
        }

        setLandlord(data.landlord);
        setStats(data.stats);
        setRecentListings(data.recentListings);
        setProperties(data.properties);
        setBookings(data.bookings);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        console.error('Error loading dashboard:', loadError);
        setError(loadError instanceof Error ? loadError.message : "Unable to load landlord dashboard data right now.");
        setLandlord(null);
        setStats({ totalProperties: 0, pendingApprovals: 0, confirmedBookings: 0 });
        setRecentListings([]);
        setProperties([]);
        setBookings([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveNew = form => {
    setProperties(current => [...current, { ...form, id: Date.now(), rating: null, reviews: 0, status: "pending" }]);
    setPage("listings");
  };

  const handleSaveEdit = form => {
    setProperties(current => current.map(property => (property.id === form.id ? { ...property, ...form } : property)));
  };

  const handleDelete = id => {
    setProperties(current => current.filter(property => property.id !== id));
    setEditingProperty(null);
    setPage("listings");
  };

  const handleBookingUpdate = (id, status) => {
    setBookings(current => current.map(booking => (booking.id === id ? { ...booking, status } : booking)));
  };

  const totalProperties = stats.totalProperties;
  const pendingProperties = stats.pendingApprovals;
  const confirmedBookings = stats.confirmedBookings;

  const profileInitials = useMemo(() => {
    if (landlord?.fullName) {
      return landlord.fullName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.name) {
      return userData.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }
    return "LM";
  }, [landlord]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Inter, system-ui, Arial, sans-serif" }}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={brandIconStyle}>
            <HomeIcon style={{ width: 18, height: 18, color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>HomeFind SU</div>
            <Badge variant="warning">Landlord</Badge>
          </div>
        </div>

        <nav style={navStyle}>
          {[
            ["dashboard", "Dashboard"],
            ["listings", "My listings"],
            ["requests", "Requests"],
            ["add", "+ Add property"],
            ["profile", "Profile"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => {
                setEditingProperty(null);
                setPage(value);
              }}
              style={navButtonStyle(page === value, value === "add")}
            >
              {label}
            </button>
          ))}
        </nav>

        {/*  Avatar  */}
        <div style={avatarStyle}>
          {profileInitials}
        </div>
      </header>

      <main style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <section style={panelStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                border: `3px solid ${C.border}`,
                borderTop: `3px solid ${C.blue}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginRight: 12,
              }} />
              <p style={{ margin: 0, color: C.textSec }}>Loading dashboard...</p>
            </div>
          </section>
        ) : null}

        {error ? (
          <section style={{ ...panelStyle, borderColor: C.danger }}>
            <div style={{ textAlign: "center", padding: 20 }}>
              <p style={{ margin: 0, color: C.danger, fontWeight: 600 }}>{error}</p>
              <button 
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                style={{ 
                  marginTop: 12, 
                  padding: "8px 24px", 
                  background: C.blue, 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 6, 
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Go to Login
              </button>
            </div>
          </section>
        ) : null}

        {!loading && !error && page === "dashboard" ? (
          <div style={{ display: "grid", gap: 24 }}>
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <StatCard 
                label="Total Properties" 
                value={totalProperties} 
                icon={<BuildingOffice2Icon style={{ width: 24, height: 24 }} />}
                tone="text"
              />
              <StatCard 
                label="Pending Approvals" 
                value={pendingProperties} 
                icon={<ClipboardDocumentListIcon style={{ width: 24, height: 24 }} />}
                tone="warning"
              />
              <StatCard 
                label="Confirmed Bookings" 
                value={confirmedBookings} 
                icon={<HomeModernIcon style={{ width: 24, height: 24 }} />}
                tone="green"
              />
            </div>

            {/* Recent Listings */}
            <section style={panelStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Recent listings</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSec }}>Your most recent property listings</p>
                </div>
                <button type="button" onClick={() => setPage("listings")} style={linkButtonStyle}>View all →</button>
              </div>
              {recentListings.length > 0 ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {recentListings.map(property => (
                    <div key={property.id} style={rowStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: C.blueTint,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: C.blue,
                          flexShrink: 0,
                        }}>
                          <BuildingOffice2Icon style={{ width: 20, height: 20 }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{property.title}</div>
                          <div style={{ color: C.textSec, fontSize: 12 }}>
                            <MapPinIcon style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} />
                            {property.location} · KSh {Number(property.price).toLocaleString()}/mo
                          </div>
                        </div>
                      </div>
                      <Badge variant={property.status === "pending" ? "pending" : property.status === "booked" ? "info" : "success"}>
                        {property.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<BuildingOffice2Icon style={{ width: 32, height: 32 }} />}
                  title="No listings yet"
                  description="Start by adding your first property listing."
                  action={
                    <button 
                      onClick={() => setPage("add")} 
                      style={{
                        padding: "10px 24px",
                        background: C.text,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      + Add Property
                    </button>
                  }
                />
              )}
            </section>
          </div>
        ) : null}

        {!loading && !error && page === "listings" ? (
          <section style={panelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>My listings</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSec }}>Review, edit, or delete your properties</p>
              </div>
              <button type="button" onClick={() => setPage("add")} style={primaryActionButton}>
                <PlusIcon style={{ width: 16, height: 16, marginRight: 6 }} />
                Add property
              </button>
            </div>

            {properties.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                {properties.map(property => (
                  <div key={property.id} style={listingCardStyle}>
                    <div style={listingTopRowStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: C.blueTint,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: C.blue,
                          flexShrink: 0,
                        }}>
                          <BuildingOffice2Icon style={{ width: 20, height: 20 }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{property.title}</div>
                          <div style={{ color: C.textSec, fontSize: 12 }}>
                            {property.location} · {property.type}
                          </div>
                        </div>
                      </div>
                      <Badge variant={property.status === "pending" ? "pending" : property.status === "booked" ? "info" : "success"}>
                        {property.status}
                      </Badge>
                    </div>

                    <div style={listingBottomRowStyle}>
                      <div style={{ fontWeight: 600, fontSize: 16, color: C.text }}>
                        KSh {Number(property.price).toLocaleString()}
                        <span style={{ fontSize: 12, fontWeight: 400, color: C.textSec }}>/mo</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={() => setEditingProperty(property)} style={ghostButtonStyle}>Edit</button>
                        <button type="button" onClick={() => handleDelete(property.id)} style={dangerGhostButtonStyle}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<BuildingOffice2Icon style={{ width: 32, height: 32 }} />}
                title="No properties listed"
                description="Click the button above to add your first property listing."
                action={null}
              />
            )}
          </section>
        ) : null}

        {page === "requests" ? <PropertyRequests bookings={bookings} onUpdate={handleBookingUpdate} /> : null}

        {page === "add" ? <AddProperty onSave={handleSaveNew} onCancel={() => setPage("dashboard")} /> : null}

        {/* Profile Page */}
        {page === "profile" ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "24px 0" }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "32px 24px 24px", textAlign: "center", borderBottom: `1px solid ${C.border}`, background: "#FAFAF8" }}>
                  <div style={{ 
                    width: 72, 
                    height: 72, 
                    borderRadius: "50%", 
                    background: C.warnTint, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    margin: "0 auto 16px", 
                    fontSize: 28, 
                    fontWeight: 700, 
                    color: C.warning 
                  }}>
                    {profileInitials}
                  </div>
                  
                  {loading ? (
                    <>
                      <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: C.text }}>Loading profile</p>
                      <p style={{ fontSize: 13, color: C.textSec, margin: "0 0 12px" }}>Fetching landlord information</p>
                    </>
                  ) : error ? (
                    <>
                      <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: C.text }}>Could not load profile</p>
                      <p style={{ fontSize: 13, color: C.textSec, margin: "0 0 12px" }}>{error}</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: C.text }}>
                        {landlord?.fullName || "Landlord"}
                      </p>
                      <p style={{ fontSize: 13, color: C.textSec, margin: "0 0 4px" }}>
                        {landlord?.email || "No email on record"}
                      </p>
                      {landlord?.phone && (
                        <p style={{ fontSize: 13, color: C.textSec, margin: "0 0 16px" }}>
                          📞 {landlord.phone}
                        </p>
                      )}
                    </>
                  )}
                  <Badge variant="warning">Landlord</Badge>
                </div>

                <div style={{ padding: "8px 0" }}>
                  {[
                    { icon: <UserCircleIcon style={{ width: 20, height: 20 }} />, label: "Personal info", action: null },
                    { icon: <HomeIcon style={{ width: 20, height: 20 }} />, label: "My listings", action: () => setPage("listings") },
                    { icon: <ClipboardDocumentListIcon style={{ width: 20, height: 20 }} />, label: "Property requests", action: () => setPage("requests") },
                    { icon: <BellIcon style={{ width: 20, height: 20 }} />, label: "Notifications", action: null },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={item.action}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 24px",
                        background: "none",
                        border: "none",
                        borderBottom: index < 3 ? `1px solid ${C.border}` : "none",
                        cursor: item.action ? "pointer" : "default",
                        textAlign: "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (item.action) e.currentTarget.style.background = C.blueTint;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ color: C.textSec }}>{item.icon}</span>
                        <span style={{ fontSize: 14, color: C.text }}>{item.label}</span>
                      </div>
                      {item.action && (
                        <span style={{ color: C.textTer, fontSize: 18 }}>→</span>
                      )}
                    </button>
                  ))}
                </div>

                {/*  Logout button */}
                <button 
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  }}
                  style={{ 
                    width: "100%", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    padding: "14px 24px", 
                    background: "none", 
                    border: "none",
                    borderTop: `1px solid ${C.border}`,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.dangerTint}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ color: C.danger }}>
                    <ArrowRightOnRectangleIcon style={{ width: 20, height: 20 }} />
                  </span>
                  <span style={{ fontSize: 14, color: C.danger, fontWeight: 600 }}>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {editingProperty ? (
        <EditProperty
          property={editingProperty}
          onSave={handleSaveEdit}
          onClose={() => setEditingProperty(null)}
          onDelete={handleDelete}
        />
      ) : null}
    </div>
  );
}

export default LandlordDashboard;


const headerStyle = {
  background: C.surface,
  borderBottom: `1px solid ${C.border}`,
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 32px",
  flexWrap: "wrap",
};

const brandIconStyle = {
  width: 34,
  height: 34,
  borderRadius: 10,
  background: C.blue,
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontWeight: 700,
};

const navStyle = {
  display: "flex",
  gap: 4,
  flexWrap: "wrap",
  justifyContent: "center",
};

const navButtonStyle = (active, emphasized = false) => ({
  border: "none",
  borderRadius: 8,
  padding: "8px 16px",
  cursor: "pointer",
  background: emphasized ? C.text : active ? C.blueTint : "transparent",
  color: emphasized ? "#fff" : active ? C.blue : C.textSec,
  fontWeight: active || emphasized ? 600 : 500,
  fontSize: 13,
  transition: "all 0.15s",
});


const avatarStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: C.warnTint,
  color: C.warning,
  display: "grid",
  placeItems: "center",
  fontWeight: 700,
  flexShrink: 0,
  fontSize: 13,
};

const panelStyle = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: 24,
};

const rowStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  background: "#FAFAF8",
  transition: "box-shadow 0.15s",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 20,
  flexWrap: "wrap",
};

const listingCardStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: 16,
  display: "grid",
  gap: 12,
  background: "#FAFAF8",
  transition: "box-shadow 0.15s",
};

const listingTopRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const listingBottomRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const primaryActionButton = {
  border: "none",
  borderRadius: 8,
  padding: "10px 20px",
  background: C.text,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  transition: "opacity 0.15s",
};

const linkButtonStyle = {
  border: "none",
  background: "transparent",
  color: C.blue,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  padding: "8px 12px",
  transition: "opacity 0.15s",
};

const ghostButtonStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: "6px 16px",
  background: "#fff",
  color: C.text,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
  transition: "all 0.15s",
};

const dangerGhostButtonStyle = {
  border: `1px solid ${C.danger}`,
  borderRadius: 6,
  padding: "6px 16px",
  background: "#fff",
  color: C.danger,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
  transition: "all 0.15s",
};