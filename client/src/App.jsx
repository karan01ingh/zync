

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Room from "./pages/Room.jsx";
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx";
import ProtectedRoute from "./pages/protectedRoute.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/room/:roomId" element={
          <ProtectedRoute>
          <Room />
          </ProtectedRoute>
          } />
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;