
import React from "react";

const Navbar = ({ darkMode, toggleTheme }) => {
  return (
    <nav
      className="navbar"
      style={{ 
        backgroundColor: darkMode ? "#1a1a1a" : "#ffffff", 
        color: darkMode ? "#ffffff" : "#000000", 
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
        borderBottom: darkMode ? "1px solid #333" : "1px solid #e0e0e0"
      }}
    >
      <div className="logo" style={{ fontWeight: "bold", fontSize: "1.2rem" }}>⚡ Contest</div>
      <ul style={{ display: "flex", gap: "2rem", listStyle: "none", margin: 0, padding: 0 }}>
        <li style={{ cursor: "pointer", padding: "0.5rem 1rem", borderRadius: "4px", transition: "background 0.2s" }}
            onMouseEnter={(e) => e.target.style.background = darkMode ? "#333" : "#f0f0f0"}
            onMouseLeave={(e) => e.target.style.background = "transparent"}>Problems</li>
        <li style={{ cursor: "pointer", padding: "0.5rem 1rem", borderRadius: "4px", transition: "background 0.2s" }}
            onMouseEnter={(e) => e.target.style.background = darkMode ? "#333" : "#f0f0f0"}
            onMouseLeave={(e) => e.target.style.background = "transparent"}>Leaderboard</li>
       
      </ul>
      <div className="actions" style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={toggleTheme}
          style={{ 
            marginRight: "1rem", 
            padding: "0.5rem 1rem", 
            cursor: "pointer",
            backgroundColor: darkMode ? "#333" : "#f0f0f0",
            color: darkMode ? "#fff" : "#000",
            border: darkMode ? "1px solid #444" : "1px solid #ddd",
            borderRadius: "4px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = darkMode ? "#444" : "#e0e0e0";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = darkMode ? "#333" : "#f0f0f0";
          }}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
        <button style={{ 
          padding: "0.5rem 1rem", 
          cursor: "pointer",
          backgroundColor: darkMode ? "#333" : "#f0f0f0",
          color: darkMode ? "#fff" : "#000",
          border: darkMode ? "1px solid #444" : "1px solid #ddd",
          borderRadius: "4px",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = darkMode ? "#444" : "#e0e0e0";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = darkMode ? "#333" : "#f0f0f0";
        }}>Profile</button>
      </div>
    </nav>
  );
};

export default Navbar;