import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SeatForm from "./components/SeatForm";
import SeatGrid from "./components/SeatGrid";
import Login from "./components/Login";
import global1 from "./global1";

function App() {
  const [seating, setSeating] = useState([]);
  const [authenticated, setAuthenticated] = useState(global1.authenticated);

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (authenticated !== global1.authenticated) {
        setAuthenticated(global1.authenticated);
      }
    }, 300); 

    return () => clearInterval(interval);
  }, [authenticated]);

  return (
    <Router>
      <div className="App p-4">
        <Routes>
          <Route
            path="/"
            element={
              authenticated ? <Navigate to="/seating" /> : <Login />
            }
          />

          <Route
            path="/seating"
            element={
              authenticated ? (
                <div>
                 
                  <SeatForm setSeating={setSeating} />
                  <SeatGrid seating={seating} />
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
