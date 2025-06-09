// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./LoginRegister.module.css";
// import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

// const LoginRegister = ({ setIsAuthenticated }) => {
//   const [action, setAction] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");

//   const [registerUsername, setRegisterUsername] = useState("");
//   const [registerEmail, setRegisterEmail] = useState("");
//   const [registerPassword, setRegisterPassword] = useState("");

//   const registerLink = () => {
//     setAction(" active");
//     setMessage("");
//   };

//   const loginLink = () => {
//     setAction("");
//     setMessage("");
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("http://127.0.0.1:5000/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email: loginEmail, password: loginPassword }),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         setMessage(data.error || data.message || "Login failed");
//       } else {
//         setMessage(data.message);
//         localStorage.setItem("user_id", data.user_id)
//         console.log("Login successful, user_id:", data.user_id);
//         setIsAuthenticated(true);
//         navigate("/todo");
//         // Handle successful login here (e.g., store user data or redirect)
//       }
//     } catch (err) {
//       setMessage("Server error. Please try again later.");
//     }
//   };

//   const checkSession = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:5000/debug-session", {
//         method: "GET",
//         credentials: "include",
//       });
//       const data = await response.json();
//       console.log("Session debug data:", data);
//       setMessage(JSON.stringify(data, null, 2));
//     } catch (err) {
//       console.error("Session check error:", err);
//       setMessage("Failed to check session");
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("http://127.0.0.1:5000/insert_user", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: registerEmail,
//           password: registerPassword,
//           name: registerUsername,
//         }),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         setMessage(data.error || data.message || "Registration failed");
//       } else {
//         setMessage(data.message);
//         // Optionally, switch to login form after successful registration
//         loginLink();
//       }
//     } catch (err) {
//       setMessage("Server error. Please try again later.");
//     }
//   };

//   return (
//     <div className={`wrapper${action}`}>
//       <div className="form-box login">
//         <form onSubmit={handleLogin}>
//           <h1>Login</h1>
//           <div className="inputbox">
//             <input
//               type="text"
//               placeholder="Email"
//               required
//               value={loginEmail}
//               onChange={(e) => setLoginEmail(e.target.value)}
//             />
//             <FaUser className="icon" />
//           </div>
//           <div className="inputbox">
//             <input
//               type="password"
//               placeholder="Password"
//               required
//               value={loginPassword}
//               onChange={(e) => setLoginPassword(e.target.value)}
//             />
//             <FaLock className="icon" />
//           </div>

//           <div className="remember-forget">
//             <label>
//               <input type="checkbox" />
//               Remember Me
//             </label>
//             <a href="#">Forgot Password</a>
//           </div>

//           <button type="submit">Login</button>

//           <div className="register-link">
//             <p>
//               Don't have an account?
//               <a href="#" onClick={registerLink}>
//                 {" "}
//                 Register
//               </a>
//             </p>
//           </div>
//         </form>
//       </div>

//       <div className="form-box signup">
//         <form onSubmit={handleRegister}>
//           <h1>Sign Up</h1>
//           <div className="inputbox">
//             <input
//               type="text"
//               placeholder="Username"
//               required
//               value={registerUsername}
//               onChange={(e) => setRegisterUsername(e.target.value)}
//             />
//             <FaUser className="icon" />
//           </div>
//           <div className="inputbox">
//             <input
//               type="email"
//               placeholder="Email"
//               required
//               value={registerEmail}
//               onChange={(e) => setRegisterEmail(e.target.value)}
//             />
//             <FaEnvelope className="icon" />
//           </div>
//           <div className="inputbox">
//             <input
//               type="password"
//               placeholder="Password"
//               required
//               value={registerPassword}
//               onChange={(e) => setRegisterPassword(e.target.value)}
//             />
//             <FaLock className="icon" />
//           </div>

//           <div className="remember-forget">
//             <label>
//               <input type="checkbox" />I agree to terms & conditions
//             </label>
//           </div>

//           <button type="submit">Sign Up</button>

//           <div className="register-link">
//             <p>
//               Already have an account?
//               <a href="#" onClick={loginLink}>
//                 {" "}
//                 Login
//               </a>
//             </p>
//           </div>
//         </form>
//       </div>
//       {message && <p className="message">{message}</p>}
//     </div>
//   );
// };

// export default LoginRegister;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import styles from "./LoginRegister.module.css"; // Corrected import
// import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

// const LoginRegister = ({ setIsAuthenticated }) => {
//   const [action, setAction] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");

//   const [registerUsername, setRegisterUsername] = useState("");
//   const [registerEmail, setRegisterEmail] = useState("");
//   const [registerPassword, setRegisterPassword] = useState("");

//   const registerLink = () => {
//     setAction(styles.active);
//     setMessage("");
//   };

//   const loginLink = () => {
//     setAction("");
//     setMessage("");
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("http://127.0.0.1:5000/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email: loginEmail, password: loginPassword }),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         setMessage(data.error || data.message || "Login failed");
//       } else {
//         setMessage(data.message);
//         localStorage.setItem("user_id", data.user_id);
//         console.log("Login successful, user_id:", data.user_id);
//         setIsAuthenticated(true);
//         navigate("/todo");
//       }
//     } catch (err) {
//       setMessage("Server error. Please try again later.");
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("http://127.0.0.1:5000/insert_user", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: registerEmail,
//           password: registerPassword,
//           name: registerUsername,
//         }),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         setMessage(data.error || data.message || "Registration failed");
//       } else {
//         setMessage(data.message);
//         loginLink();
//       }
//     } catch (err) {
//       setMessage("Server error. Please try again later.");
//     }
//   };

//   useEffect(() => {
//     // Apply background gradient to the body element
//     document.body.style.background =
//       "linear-gradient(90deg, rgba(60,60,237,1) 6%, rgba(9,9,121,1) 49%, rgba(56,20,124,1) 100%)";

//     // Clean up when the component unmounts (optional)
//     return () => {
//       document.body.style.background = ""; // Reset the background on cleanup
//     };
//   }, []);

//   return (
//     <div className={`${styles.wrapper} ${action}`}>
//       {/* Apply CSS Modules */}
//       <div className={styles.form_box}>
//         <form onSubmit={handleLogin}>
//           <h1>Login</h1>
//           <div className={styles.inputbox}>
//             <input
//               type="text"
//               placeholder="Email"
//               required
//               value={loginEmail}
//               onChange={(e) => setLoginEmail(e.target.value)}
//             />
//             <FaUser className={styles.icon} />
//           </div>
//           <div className={styles.inputbox}>
//             <input
//               type="password"
//               placeholder="Password"
//               required
//               value={loginPassword}
//               onChange={(e) => setLoginPassword(e.target.value)}
//             />
//             <FaLock className={styles.icon} />
//           </div>
//           <button type="submit">Login</button>
//           <div className={styles.register_link}>
//             <p>
//               Don't have an account?
//               <a href="#" onClick={registerLink}>
//                 {" "}
//                 Register
//               </a>
//             </p>
//           </div>
//         </form>
//       </div>

//       <div className={styles.form_box}>
//         <form onSubmit={handleRegister}>
//           <h1>Sign Up</h1>
//           <div className={styles.inputbox}>
//             <input
//               type="text"
//               placeholder="Username"
//               required
//               value={registerUsername}
//               onChange={(e) => setRegisterUsername(e.target.value)}
//             />
//             <FaUser className={styles.icon} />
//           </div>
//           <div className={styles.inputbox}>
//             <input
//               type="email"
//               placeholder="Email"
//               required
//               value={registerEmail}
//               onChange={(e) => setRegisterEmail(e.target.value)}
//             />
//             <FaEnvelope className={styles.icon} />
//           </div>
//           <div className={styles.inputbox}>
//             <input
//               type="password"
//               placeholder="Password"
//               required
//               value={registerPassword}
//               onChange={(e) => setRegisterPassword(e.target.value)}
//             />
//             <FaLock className={styles.icon} />
//           </div>
//           <button type="submit">Sign Up</button>
//           <div className={styles.register_link}>
//             <p>
//               Already have an account?
//               <a href="#" onClick={loginLink}>
//                 {" "}
//                 Login
//               </a>
//             </p>
//           </div>
//         </form>
//       </div>
//       {message && <p className={styles.message}>{message}</p>}
//     </div>
//   );
// };

// export default LoginRegister;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginRegister.module.css";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

const LoginRegister = ({ setIsAuthenticated }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const registerLink = (e) => {
    e.preventDefault();
    setIsSignUp(true);
    setMessage("");
  };

  const loginLink = (e) => {
    e.preventDefault();
    setIsSignUp(false);
    setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || data.message || "Login failed");
      } else {
        setMessage(data.message);
        localStorage.setItem("user_id", data.user_id);
        console.log("Login successful, user_id:", data.user_id);
        setIsAuthenticated(true);
        navigate("/todo");
      }
    } catch (err) {
      setMessage("Server error. Please try again later.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/insert_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerUsername,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || data.message || "Registration failed");
      } else {
        setMessage(data.message);
        loginLink(e);
      }
    } catch (err) {
      setMessage("Server error. Please try again later.");
    }
  };

  useEffect(() => {
    // Apply background gradient to the body element
    document.body.style.background =
      "linear-gradient(90deg, rgba(60,60,237,1) 6%, rgba(9,9,121,1) 49%, rgba(56,20,124,1) 100%)";

    // Clean up when the component unmounts
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <div className={`${styles.wrapper} ${isSignUp ? styles.active : ""}`}>
      <div className={`${styles.form_box} ${styles.login}`}>
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <div className={styles.inputbox}>
            <input
              type="text"
              placeholder="Email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <FaUser className={styles.icon} />
          </div>
          <div className={styles.inputbox}>
            <input
              type="password"
              placeholder="Password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <FaLock className={styles.icon} />
          </div>
          <button type="submit">Login</button>
          <div className={styles.register_link}>
            <p>
              Don't have an account?
              <a href="#" onClick={registerLink}>
                {" "}
                Register
              </a>
            </p>
          </div>
        </form>
      </div>

      <div className={`${styles.form_box} ${styles.signup}`}>
        <form onSubmit={handleRegister}>
          <h1>Sign Up</h1>
          <div className={styles.inputbox}>
            <input
              type="text"
              placeholder="Username"
              required
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
            />
            <FaUser className={styles.icon} />
          </div>
          <div className={styles.inputbox}>
            <input
              type="email"
              placeholder="Email"
              required
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
            <FaEnvelope className={styles.icon} />
          </div>
          <div className={styles.inputbox}>
            <input
              type="password"
              placeholder="Password"
              required
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <FaLock className={styles.icon} />
          </div>
          <button type="submit">Sign Up</button>
          <div className={styles.register_link}>
            <p>
              Already have an account?
              <a href="#" onClick={loginLink}>
                {" "}
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default LoginRegister;