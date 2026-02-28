import React, { useState, useEffect, useCallback } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

const INITIAL_COUNT = 5;

const generateRandomHex = () => {
  const chars = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += chars[Math.floor(Math.random() * 16)];
  }
  return color;
};

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

const getLuminance = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export default function App() {
  const [colors, setColors] = useState(() =>
    Array.from({ length: INITIAL_COUNT }, () => ({
      hex: generateRandomHex(),
      locked: false,
    })),
  );
  const [toast, setToast] = useState("");

  const generatePalette = useCallback(() => {
    setColors((prev) =>
      prev.map((c) => (c.locked ? c : { ...c, hex: generateRandomHex() })),
    );
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        generatePalette();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [generatePalette]);

  const toggleLock = (index) => {
    setColors((prev) => {
      const newColors = [...prev];
      newColors[index] = {
        ...newColors[index],
        locked: !newColors[index].locked,
      };
      return newColors;
    });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast(`Copiado ${type}: ${text}`);
      setTimeout(() => setToast(""), 2000);
    });
  };

  return (
    <div className="app-container">
      <div className="hint">Presiona la barra espaciadora para generar</div>

      <div className="palette">
        {colors.map((color, index) => {
          const isDark = getLuminance(color.hex) < 0.5;
          const textColor = isDark ? "#ffffff" : "#000000";

          return (
            <div
              key={index}
              className="color-bar"
              style={{ backgroundColor: color.hex, color: textColor }}
            >
              <div className="color-info" style={{ color: textColor }}>
                <span
                  className="color-hex"
                  onClick={() => copyToClipboard(color.hex, "HEX")}
                >
                  {color.hex}
                </span>
                <span
                  className="color-rgb"
                  onClick={() => copyToClipboard(hexToRgb(color.hex), "RGB")}
                >
                  {hexToRgb(color.hex)}
                </span>

                <div
                  style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}
                >
                  <button
                    className={`icon-btn ${color.locked ? "locked" : ""}`}
                    onClick={() => toggleLock(index)}
                    title={color.locked ? "Desbloquear" : "Bloquear"}
                    style={{ color: color.locked ? "#fbbf24" : textColor }}
                  >
                    <i
                      className={`bi bi-${color.locked ? "lock-fill" : "unlock"}`}
                    ></i>
                  </button>

                  <button
                    className="icon-btn"
                    onClick={() => copyToClipboard(color.hex, "HEX")}
                    title="Copiar HEX"
                    style={{ color: textColor }}
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="controls">
        <button className="btn-generate" onClick={generatePalette}>
          <i className="bi bi-shuffle"></i> Generar Nueva
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
