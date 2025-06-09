import { useState } from "react";
import "./welcome.css";
import Navwelcome from "./components/navbar.jsx";
import logo from "./components/logo.png"; 

function Welcome() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen"  // background
      style={{
        background: "radial-gradient(circle,rgb(178, 134, 250),rgb(67, 28, 183))"
      }}
    >
      <Navwelcome/>

      <div className="circle">
        <div className="headingPos">
          <h1 className="heading">Welcome to</h1>
          <img src={logo} alt="Planora Logo" className="logowelcome" />
        </div>
      </div>
      
    </div>
  );
}

export default Welcome;

