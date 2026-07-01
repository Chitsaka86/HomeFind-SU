import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  MapPinIcon,
  XMarkIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import PropertyMap from "../../components/maps/PropertyMap.jsx";
import { Badge, C, Stars } from "./studentUi.jsx";
import { saveProperty, unsaveProperty, checkSavedStatus } from "../../services/savedPropertiesService.js";
import { createBookingRequest } from "../../services/bookingService.js";

export default function PropertyDetails({ property, onClose, onSavedChange, onBookingChange }) {
  const [bookingType, setBookingType] = useState("viewing");
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [time, setTime] = useState("10:00");
  const [note, setNote] = useState("");
  const [booked, setBooked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const propertyId = [property?.id, property?.property_id, property?.propertyId]
    .find((value) => value !== undefined && value !== null && value !== '')
    ?.toString()
    .trim();
  const propertyImages = Array.isArray(property.images) ? property.images : [];
  const thumbnailImages = propertyImages.slice(0, 4);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  
  useEffect(() => {
    const checkSaved = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.email && propertyId) {
          const saved = await checkSavedStatus(propertyId);
          setIsSaved(saved);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };
    checkSaved();
  }, [propertyId]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [property.property_id, property.id]);

  useEffect(() => {
    if (selectedDate) {
      const parsedDate = new Date(`${selectedDate}T00:00:00`);
      if (!Number.isNaN(parsedDate.getTime())) {
        setCalendarMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
      }
    }
  }, [selectedDate]);

  
  const handleToggleSave = async () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email) {
      alert('Please log in to save properties');
      return;
    }

    if (!propertyId) {
      alert('This property cannot be saved right now.');
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await unsaveProperty(propertyId);
        setIsSaved(false);
      } else {
        await saveProperty(propertyId);
        setIsSaved(true);
      }
      onSavedChange?.();
    } catch (error) {
      console.error('Error toggling save:', error);
      alert(error instanceof Error ? error.message : 'Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calendarYear = calendarMonth.getFullYear();
  const calendarIndex = calendarMonth.getMonth();
  const daysInMonth = new Date(calendarYear, calendarIndex + 1, 0).getDate();
  const firstWeekday = new Date(calendarYear, calendarIndex, 1).getDay();
  const leadingDays = Array.from({ length: firstWeekday }, (_, index) => ({
    date: new Date(calendarYear, calendarIndex, index - firstWeekday + 1),
    inMonth: false,
  }));
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => ({
    date: new Date(calendarYear, calendarIndex, index + 1),
    inMonth: true,
  }));
  const totalCells = Math.ceil((leadingDays.length + monthDays.length) / 7) * 7;
  const trailingDays = Array.from({ length: totalCells - leadingDays.length - monthDays.length }, (_, index) => ({
    date: new Date(calendarYear, calendarIndex + 1, index + 1),
    inMonth: false,
  }));
  const calendarCells = [...leadingDays, ...monthDays, ...trailingDays];

  const formatCalendarDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const isSelectedDay = (date) => {
    if (!selectedDate) return false;
    return date.toISOString().split("T")[0] === selectedDate;
  };

  const isPastDay = (date) => date < todayStart;

  if (!property) {
    return null;
  }

  
  const firstImage = propertyImages.length > 0 ? propertyImages[0].url : null;
  const isValidImage = firstImage && (
    firstImage.startsWith('data:image/') || 
    firstImage.startsWith('http://') || 
    firstImage.startsWith('https://')
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="hide-scrollbar" style={{ background: C.surface, borderRadius: 14, width: "100%", maxWidth: 860, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSec, lineHeight: 1 }}>
            <ArrowLeftIcon style={{ width: 18, height: 18 }} />
          </button>
          <span style={{ fontSize: 13, color: C.textSec }}>Search results</span>
          <span style={{ fontSize: 13, color: C.textTer }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{property.title}</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.textSec }}>
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 0 }}>
          <div className="hide-scrollbar" style={{ flex: 3, padding: 20, borderRight: `1px solid ${C.border}`, overflowY: "auto" }}>
            {/* Image Gallery */}
            <div style={{ 
              height: 240, 
              borderRadius: 10, 
              overflow: "hidden", 
              background: isValidImage ? 'transparent' : "linear-gradient(135deg,#E6F1FB,#C8DFF5)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              marginBottom: 10, 
              position: "relative" 
            }}>
              {isValidImage ? (
                <img
                  src={firstImage}
                  alt={property.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    console.error('Image failed to load in PropertyDetails:', firstImage);
                    e.target.style.display = 'none';
                    
                    const parent = e.target.parentElement;
                    parent.style.background = "linear-gradient(135deg,#E6F1FB,#C8DFF5)";
                    parent.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                      <svg style="width:60px;height:60px;color:#185FA5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg></div>`;
                  }}
                />
              ) : (
                <HomeModernIcon style={{ width: 60, height: 60, color: C.blue }} />
              )}
              
              {/* Save Button on Image */}
              <button
                onClick={handleToggleSave}
                disabled={saving}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "rgba(255,255,255,0.95)",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <HeartIcon 
                  style={{ 
                    width: 22, 
                    height: 22, 
                    color: isSaved ? C.danger : C.textSec,
                    fill: isSaved ? C.danger : 'none',
                    transition: 'all 0.15s',
                  }} 
                />
              </button>
            </div>
            
            {/* Thumbnails */}
            {thumbnailImages.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 6, marginBottom: 16 }}>
                {thumbnailImages.map((image, index) => {
                  const imageUrl = image.url;
                  const isValidThumbnail = imageUrl && (
                    imageUrl.startsWith('data:image/') || 
                    imageUrl.startsWith('http://') || 
                    imageUrl.startsWith('https://')
                  );
                  
                  return (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      style={{
                        height: 54,
                        borderRadius: 6,
                        overflow: "hidden",
                        border: index === activeImageIndex ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                        background: index === activeImageIndex ? C.blueTint : "#F0F0E8",
                        padding: 0,
                        cursor: "pointer",
                        position: 'relative',
                      }}
                    >
                      {isValidThumbnail ? (
                        <img
                          src={imageUrl}
                          alt={image.caption || `${property.title} ${index + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            console.error('Thumbnail failed to load:', imageUrl);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:10px;color:${C.textSec}">No image</div>`;
                          }}
                        />
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          fontSize: 10,
                          color: C.textSec,
                        }}>
                          No image
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 3px", color: C.text }}>{property.title}</p>
                <p style={{ fontSize: 12, color: C.textSec, margin: 0 }}>
                  <MapPinIcon style={{ width: 12, height: 12, display: "inline-block", marginRight: 4, verticalAlign: "-2px" }} />
                  {property.location} · {property.distance} km from Strathmore
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: C.text }}>KSh {property.price.toLocaleString()}</p>
                <p style={{ fontSize: 10, color: C.textSec, margin: 0 }}>per month</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Stars rating={property.rating} />
              <span style={{ fontSize: 12, color: C.textSec }}>{property.rating} · {property.reviews} reviews</span>
              <Badge variant={property.status === "Available" ? "success" : "warning"}>{property.status}</Badge>
            </div>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: C.text }}>Location</p>
              <PropertyMap latitude={property.latitude} longitude={property.longitude} label={property.title} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: C.text }}>Amenities</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {property.amenities.map((amenity) => (
                <span key={amenity} style={{ fontSize: 11, padding: "3px 10px", background: "#F0F0E8", borderRadius: 9999, color: C.text, border: `1px solid ${C.border}` }}>{amenity}</span>
              ))}
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px", color: C.text }}>House rules</p>
            <p style={{ fontSize: 11, color: C.textSec, margin: "0 0 14px", lineHeight: 1.6 }}>{property.rules}</p>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: C.text }}>Landlord</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.warnTint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.warning, flexShrink: 0 }}>
                {property.landlord?.name?.split(" ").map((word) => word[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: C.text }}>{property.landlord?.name}</p>
                <p style={{ fontSize: 11, color: C.textSec, margin: 0 }}>{property.landlord?.listings} listings · {property.landlord?.verified ? 'Verified landlord' : 'Landlord'}</p>
              </div>
              {property.landlord?.verified && <span style={{ marginLeft: "auto", color: C.green, fontSize: 16 }}>✓</span>}
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: C.text }}>Reviews</p>
            {property.reviewList?.length > 0 ? (
              property.reviewList.map((review, index) => (
                <div key={index} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.blueTint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.blue }}>
                      {review.name?.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{review.name}</span>
                    <span style={{ fontSize: 10, color: C.textTer }}>{review.date}</span>
                    <Stars rating={review.rating} />
                  </div>
                  <p style={{ fontSize: 11, color: C.textSec, margin: 0 }}>{review.comment}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: C.textSec }}>No reviews yet</p>
            )}
          </div>

          <div className="hide-scrollbar" style={{ flex: 2, padding: 20, minWidth: 260, overflowY: "auto" }}>
            {booked ? (
              <div style={{ textAlign: "center", paddingTop: 40 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 30 }}>✓</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>Booking confirmed!</p>
                <p style={{ fontSize: 12, color: C.textSec, margin: "0 0 20px", lineHeight: 1.6 }}>Your request was sent to the landlord for confirmation.</p>
                <div style={{ background: "#F5F5F0", borderRadius: 8, padding: 12, marginBottom: 16, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.textSec }}>Type</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{bookingType === "viewing" ? "Physical viewing" : "Unit reservation"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.textSec }}>Date</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{selectedDate}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: C.textSec }}>Status</span>
                    <Badge variant="warning">Awaiting landlord</Badge>
                  </div>
                </div>
                <button onClick={onClose} style={{ width: "100%", background: C.text, color: "#fff", border: "none", borderRadius: 8, height: 38, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Back to search</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>Book this property</p>
                  <button
                    onClick={handleToggleSave}
                    disabled={saving}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 8px",
                      borderRadius: 6,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.blueTint}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <HeartIcon 
                      style={{ 
                        width: 20, 
                        height: 20, 
                        color: isSaved ? C.danger : C.textSec,
                        fill: isSaved ? C.danger : 'none',
                      }} 
                    />
                    <span style={{ fontSize: 12, color: isSaved ? C.danger : C.textSec }}>
                      {isSaved ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </div>
                <label style={{ fontSize: 11, color: C.textSec, display: "block", marginBottom: 6 }}>Booking type</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {[
                    { id: "viewing", icon: <CalendarDaysIcon style={{ width: 18, height: 18 }} />, label: "View visit" },
                    { id: "reservation", icon: <BuildingOffice2Icon style={{ width: 18, height: 18 }} />, label: "Reserve unit" },
                  ].map((option) => (
                    <button key={option.id} onClick={() => setBookingType(option.id)} style={{ flex: 1, border: `${bookingType === option.id ? "2px" : "1px"} solid ${bookingType === option.id ? C.blue : C.border}`, background: bookingType === option.id ? C.blueTint : "#fff", borderRadius: 8, padding: "8px 4px", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 2, color: bookingType === option.id ? C.blue : C.textSec }}>{option.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: bookingType === option.id ? 700 : 400, color: bookingType === option.id ? C.blue : C.textSec }}>{option.label}</div>
                    </button>
                  ))}
                </div>
                <label style={{ fontSize: 11, color: C.textSec, display: "block", marginBottom: 5 }}>Pick a date</label>
                <button
                  type="button"
                  onClick={() => setShowCalendar((current) => !current)}
                  style={{
                    width: "100%",
                    border: `1px solid ${C.borderMid}`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontSize: 12,
                    marginBottom: showCalendar ? 8 : 12,
                    fontFamily: "inherit",
                    color: C.text,
                    background: "#fff",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CalendarDaysIcon style={{ width: 16, height: 16, color: C.textSec }} />
                    {selectedDate || "Choose a date"}
                  </span>
                  <span style={{ color: C.textSec }}>{showCalendar ? "Hide" : "Show"}</span>
                </button>
                {showCalendar && (
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, background: "#FAFAF8", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Calendar</span>
                      <span style={{ fontSize: 11, color: C.textSec }}>Select a visit date</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarYear, calendarIndex - 1, 1))}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ArrowLeftIcon style={{ width: 16, height: 16, color: C.text }} />
                      </button>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>
                          {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth)}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: C.textSec }}>Choose a day</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarYear, calendarIndex + 1, 1))}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ArrowLeftIcon style={{ width: 16, height: 16, color: C.text, transform: "rotate(180deg)" }} />
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
                      {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                        <div key={day} style={{ fontSize: 10, fontWeight: 700, color: C.textSec, textAlign: "center" }}>
                          {day}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                      {calendarCells.map((cell, index) => {
                        const isoDate = cell.date.toISOString().split("T")[0];
                        const selected = isSelectedDay(cell.date);
                        const disabled = isPastDay(cell.date);

                        return (
                          <button
                            key={`${isoDate}-${index}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              if (disabled) return;
                              setSelectedDate(isoDate);
                              setShowCalendar(false);
                            }}
                            style={{
                              height: 38,
                              borderRadius: 8,
                              border: selected ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                              background: selected ? C.blueTint : cell.inMonth ? "#fff" : "#F4F4EF",
                              color: disabled ? C.textTer : C.text,
                              opacity: cell.inMonth ? 1 : 0.55,
                              cursor: disabled ? "not-allowed" : "pointer",
                              fontSize: 12,
                              fontWeight: selected ? 700 : 500,
                            }}
                          >
                            {cell.date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {[
                        { label: "Tomorrow", value: 1 },
                        { label: "This weekend", value: 3 },
                        { label: "Next week", value: 7 },
                      ].map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => {
                            const nextDate = new Date();
                            nextDate.setDate(nextDate.getDate() + option.value);
                            setSelectedDate(nextDate.toISOString().split("T")[0]);
                          }}
                          style={{
                            border: `1px solid ${C.border}`,
                            background: "#fff",
                            borderRadius: 9999,
                            padding: "5px 10px",
                            fontSize: 11,
                            color: C.text,
                            cursor: "pointer",
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {selectedDate && (
                      <p style={{ margin: "10px 0 0", fontSize: 11, color: C.textSec }}>
                        Selected: {formatCalendarDate(new Date(`${selectedDate}T00:00:00`))}
                      </p>
                    )}
                  </div>
                )}
                <label style={{ fontSize: 11, color: C.textSec, display: "block", marginBottom: 5 }}>Preferred time</label>
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} style={{ width: "100%", border: `1px solid ${C.borderMid}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, marginBottom: 12, fontFamily: "inherit", color: C.text, boxSizing: "border-box" }} />
                <label style={{ fontSize: 11, color: C.textSec, display: "block", marginBottom: 5 }}>Note to landlord (optional)</label>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Hi, I'd like to visit..." rows={3} style={{ width: "100%", border: `1px solid ${C.borderMid}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, resize: "none", marginBottom: 12, fontFamily: "inherit", color: C.text, boxSizing: "border-box" }} />
                {selectedDate && (
                  <div style={{ background: "#F5F5F0", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: C.textSec }}>Type</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{bookingType === "viewing" ? "Physical viewing" : "Unit reservation"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: C.textSec }}>Date</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{selectedDate}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: C.textSec }}>Time</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{time}</span>
                    </div>
                  </div>
                )}
                {bookingError ? <p style={{ fontSize: 12, color: C.danger, margin: "0 0 8px" }}>{bookingError}</p> : null}
                <button
                  onClick={async () => {
                    if (!selectedDate) return;

                    const userData = JSON.parse(localStorage.getItem("user") || "{}");
                    if (!userData.email) {
                      alert("Please log in to book a property");
                      return;
                    }

                    setBookingLoading(true);
                    setBookingError("");
                    try {
                      const normalizedPropertyId = [property?.id, property?.property_id, property?.propertyId]
                        .find((value) => value !== undefined && value !== null && value !== "")
                        ?.toString()
                        .trim();

                      if (!normalizedPropertyId) {
                        throw new Error("This property is missing a valid id.");
                      }

                      await createBookingRequest({
                        propertyId: normalizedPropertyId,
                        bookingDate: selectedDate,
                        bookingTime: time,
                        type: bookingType === "reservation" ? "reservation" : "viewing",
                        message: note,
                      });

                      setBooked(true);
                      onBookingChange?.();
                    } catch (error) {
                      console.error("Error creating booking:", error);
                      setBookingError(error instanceof Error ? error.message : "Unable to create booking request.");
                    } finally {
                      setBookingLoading(false);
                    }
                  }}
                  disabled={!selectedDate || bookingLoading}
                  style={{ width: "100%", background: selectedDate && !bookingLoading ? C.text : "#ccc", color: "#fff", border: "none", borderRadius: 8, height: 40, fontSize: 13, fontWeight: 700, cursor: selectedDate && !bookingLoading ? "pointer" : "not-allowed", marginBottom: 8, transition: "opacity 0.15s" }}
                >
                  {bookingLoading ? "Creating request..." : "Confirm booking"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}