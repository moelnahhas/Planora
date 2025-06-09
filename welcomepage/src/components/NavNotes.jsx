import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./navbar.css";
import logo from "./logo.png"; 


async function logout(navigate) {
  try {
    const response = await fetch("http://127.0.0.1:5000/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      navigate("/login"); 
    } else {
      console.error("Logout failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

function NavNotes() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-brand">
          <span className="navplanora">Planora</span>
          <img src={logo} alt="Planora Logo" className="logo" />
        </div>
        <div className="logpos">
          <button className="navlogbtns" onClick={() => navigate("/todo")}>
            To-do List
          </button>
          <button className="navlogbtns" onClick={() => navigate("/schedule")}>
            Schedule
          </button>
          <button className="navlogbtns" onClick={() => navigate("/login")}> 
            Notes 
          </button>
          <button className="navlogbtns" onClick={() => logout(navigate)}>
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavNotes;
