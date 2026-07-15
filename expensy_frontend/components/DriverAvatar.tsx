const PALETTES = [
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#FFEDD5", text: "#9A3412" },
];

export default function DriverAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const palette = PALETTES[name.charCodeAt(0) % PALETTES.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: palette.bg, color: palette.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0, userSelect: "none",
    }}>
      {initials}
    </div>
  );
}
