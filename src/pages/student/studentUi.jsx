export const C = {
  bg: "#F5F5F0",
  surface: "#FFFFFF",
  border: "#E0E0D8",
  borderMid: "#CCCCCC",
  text: "#1A1A1A",
  textSec: "#6B6B65",
  textTer: "#9B9B95",
  blue: "#185FA5",
  blueTint: "#E6F1FB",
  blueBorder: "#B5D4F4",
  green: "#3B6D11",
  greenTint: "#EAF3DE",
  greenBorder: "#A0C878",
  warning: "#BA7517",
  warnTint: "#FAEEDA",
  warnBorder: "#ECC07A",
  danger: "#E24B4A",
  dangerTint: "#FCEBEB",
  star: "#EF9F27",
};

export const Badge = ({ variant = "success", children }) => {
  const styles = {
    success: { background: C.greenTint, color: C.green, border: `1px solid ${C.greenBorder}` },
    warning: { background: C.warnTint, color: C.warning, border: `1px solid ${C.warnBorder}` },
    info: { background: C.blueTint, color: C.blue, border: `1px solid ${C.blueBorder}` },
    neutral: { background: "#F0F0E8", color: C.textSec, border: `1px solid ${C.border}` },
  };

  return (
    <span
      style={{
        ...styles[variant],
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 9999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

export const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span style={{ color: C.star, fontSize: 13, letterSpacing: 1 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}
    </span>
  );
};