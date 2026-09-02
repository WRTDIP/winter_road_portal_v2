import React from "react";
import ReactDOM from "react-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "antd/dist/antd.min.css";
import "antd/dist/antd.variable.min.css";
import NavigationBar from "./components/Global/NavigationBar/index.jsx";
import Home from "./pages/Home/Home.jsx";
import Footer from "./components/Global/Footer/index.jsx";
import Projects from "./pages/Projects/Projects.jsx";
import About from "./pages/About/index.jsx";
import Transportation from "./pages/Transportation/index.jsx";
import Observation from "./pages/Observation/index.jsx";
import Login from "./pages/Login/Login.jsx";
import Map from "./components/Map/Map.jsx";
import Register from "./pages/Register/Register.jsx";
import ResendEmailValidation from "./pages/ResendEmailValidation/ResendEmailValidation.jsx";
import EmailValidationFormPage from "./pages/ValidateEmail/EmailValidationFormPage.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import FDDTest from "./pages/FDDTest/FDDTest.jsx";
import Api from "./pages/Api/index.jsx";
import Download from "./pages/Download/index.jsx";
import { Auth0Provider } from "@auth0/auth0-react";


/**
 * Entry point of the React application.
 * Renders the application with routing support.
 */
ReactDOM.render(
    <Auth0Provider
      domain="dev-chk7fj0z6p5bj1da.ca.auth0.com"
      clientId="qoVWsLJu8GfiJH4ZDlYZvh3eehrp4Ofa"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
  <div>
    {/* Set up router for client-side routing */}
    <Router>
      {/* Render global navigation bar */}
      <NavigationBar />

      {/* Define routes of all the components */}
      <Routes>
        <Route path="/" element={<Home />} exact />
        <Route path="/projects" element={<Projects />} exact />
        <Route path="/about" element={<About />} exact />
        <Route path="/map" element={<Map />} exact />
        <Route path="/transportation" element={<Transportation />} exact />
        <Route path="/observation" element={<Observation />} exact />
        <Route path="/login" element={<Login />} exact />
        <Route path="/register" element={<Register />} exact />
        <Route path="/resend-email-validation" element={<ResendEmailValidation />} exact />
        <Route path="/validate-email" element={<EmailValidationFormPage />} exact />
        <Route path="/dashboard" element={<Dashboard />} exact />
        <Route path="/fdd-test" element={<FDDTest />} exact />
        <Route path="/api" element={<Api />} exact />
        <Route path="/download" element={<Download />} exact />
      </Routes>

      {/* Render global footer */}
      <Footer />
    </Router>
  </div>
  </Auth0Provider>,
  // Mount the root component into the 'root' element in the HTML
  document.getElementById("root")
);
