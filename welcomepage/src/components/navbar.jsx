import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./navbar.css";
import logo from "./logo.png"; 

function Navwelcome() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-brand">
          <span className="navplanora">Planora</span>
          <img src={logo} alt="Planora Logo" className="logo" />
        </div>
        <div className="slogan">Path to Perfect Productivity</div>
        <div className="nav-buttons">
          <button className="login-btn" onClick={() => navigate("/login")}>
            Sign-Up / Log-In
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navwelcome;
