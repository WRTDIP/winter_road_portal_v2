import React from "react"
import ReactDOM from "react-dom"
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import "./index.css"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import "antd/dist/antd.min.css"
import "antd/dist/antd.variable.min.css"
import NavigationBar from "./components/Global/NavigationBar"
import Home from "./pages/Home/Home"
import Footer from "./components/Global/Footer"
import Projects from "./pages/Projects/Projects"
import About from "./pages/About"
import Transportation from "./pages/Transportation"
import Observation from "./pages/Observation"
import Login from "./pages/Login/Login.jsx"
import Map from "./components/Map/Map.jsx"
import DashboardPage from "./pages/Dashboard/Dashboard.jsx"

import { Box } from "@mui/material"
import { height } from "@fortawesome/free-regular-svg-icons/faAddressBook"

/**
 * Entry point of the React application.
 * Renders the application with routing support.
 */
ReactDOM.render(
  <div sx={{ height: "100%" }}>
    {/* Set up router for client-side routing */}
    <Router>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
        }}
      >
        {/* Render global navigation bar */}
        <NavigationBar />

        <div sx={{ flex: 4 }}>
          {/* Define routes of all the components */}
          <Routes>
            <Route path="/" element={<Home />} exact />
            <Route path="/dashboard" element={<DashboardPage />} exact />
            <Route path="/projects" element={<Projects />} exact />
            <Route path="/about" element={<About />} exact />
            <Route path="/map" element={<Map />} exact />
            <Route path="/transportation" element={<Transportation />} exact />
            <Route path="/observation" element={<Observation />} exact />
            <Route path="/login" element={<Login />} exact />
          </Routes>
        </div>
        {/* Render global footer */}
        <Footer />
      </Box>
    </Router>
  </div>,
  // Mount the root component into the 'root' element in the HTML
  document.getElementById("root")
)
