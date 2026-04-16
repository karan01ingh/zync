import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Room from "./pages/Room.jsx";
import { StrictMode } from "react";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // import your App component

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// function App() {
  // return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<Home/>} />
    //     <Route path="/room/:roomId" element={<Room/>} />
    //   </Routes>
    // </BrowserRouter>
;// };

// export default App;