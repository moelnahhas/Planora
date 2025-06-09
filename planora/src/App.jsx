import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginRegister from "./components/LoginRegister";
import Todo from "../../todo2/src/Todo";
// import NotesAPI from "../../notes/src/NotesAPI.jsx";
import { useState, useEffect } from "react";
import Welcome from "../../welcomepage/src/welcome";
import Schedule from "../../todo2/src/Schedule";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/check_session", {
          method: "GET",
          credentials: "include", // Ensure cookies are sent with the request
        });
        const data = await response.json();
        if (data.user_id) {
          setIsAuthenticated(true); // User is authenticated
        } else {
          setIsAuthenticated(false); // No user_id in session
        }
      } catch (err) {
        setIsAuthenticated(false); // Error with session check, so treat as not authenticated
      }
    };

    checkSession();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
      {
        /* CHANGED FROM LOGIN TO WELCOME */
      }
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* ADDED THIS -- 100% something is going weird so ... look at it properly later!  */}

          <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/todo" /> : <Navigate to="/welcome" />}
  />

        <Route path="/welcome" element={<Welcome />} />
        
        <Route
          path="/login"
          element={<LoginRegister setIsAuthenticated={setIsAuthenticated} />}
        />

        <Route
          path="/todo"
          element={
            <ProtectedRoute>
              <Todo />
            </ProtectedRoute>
          }
        />

      <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Todo initialPage="schedule" />
              {/* <Schedule />  could be this messing it up ... */}
            </ProtectedRoute>
          }
        />

      {/* <Route
        path="/schedule"
        element={<Todo initialPage="schedule" />}
      /> */}

      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
