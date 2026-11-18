import React from "react";
import ReactDOM from "react-dom";
import "./styles/tokens.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import "antd/dist/antd.min.css";
import "./styles/base.css";
import AppShell from "./components/Global/AppShell/index.jsx";
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
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import FDDTest from "./pages/FDDTest/FDDTest.jsx";
import Api from "./pages/Api/index.jsx";
import Download from "./pages/Download/index.jsx";
import References from "./pages/References/index.jsx";
import Blog from "./pages/Blog/index.jsx";
import QRCodePage from "./pages/QRCode/index.jsx";
import { AccountProvider } from "./components/Auth0/AccountProvider.jsx";

/* Dev-only responsive harness. `import.meta.env.DEV` is a literal at build
   time, so the production bundle keeps neither the route nor the chunk behind
   this import. Run `npm run dev` and open /dev/responsive. */
const ResponsiveHarness = import.meta.env.DEV
  ? React.lazy(() => import("./dev/harness/ResponsiveHarness.jsx"))
  : null;


/**
 * Entry point of the React application.
 * Renders the application with routing support.
 */
ReactDOM.render(
  <Router>
    <AccountProvider>
    {/* App shell: a flex column at least one viewport tall, so short pages
        still push the footer to the bottom of the screen. Inside the Router
        because it reads the route. See styles/base.css. */}
    <AppShell>
      {/* Render global navigation bar */}
      <NavigationBar />

      {/* Define routes of all the components. <main> takes the leftover
          height so the footer never floats up into the middle of a short page. */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} exact />
          <Route path="/projects" element={<Projects />} exact />
          <Route path="/about" element={<About />} exact />
          <Route path="/map" element={<Map />} exact />
          <Route path="/transportation" element={<Transportation />} exact />
          <Route path="/observation" element={<Observation />} exact />
          <Route path="/login" element={<Login />} exact />
          <Route path="/register" element={<Register />} exact />
          <Route path="/forgot-password" element={<ForgotPassword />} exact />
          <Route path="/resend-email-validation" element={<Navigate to="/login" replace />} />
          <Route path="/validate-email" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Dashboard />} exact />
          <Route path="/fdd-test" element={<FDDTest />} exact />
          <Route path="/api" element={<Api />} exact />
          <Route path="/download" element={<Download />} exact />
          <Route path="/references" element={<References />} exact />
          <Route path="/blog" element={<Blog />} exact />
          <Route path="/qrcode" element={<QRCodePage />} exact />
          {ResponsiveHarness && (
            <Route
              path="/dev/responsive"
              element={
                <React.Suspense fallback={null}>
                  <ResponsiveHarness />
                </React.Suspense>
              }
            />
          )}
        </Routes>
      </main>

      {/* Render global footer */}
      <Footer />
    </AppShell>
    </AccountProvider>
  </Router>,
  // Mount the root component into the 'root' element in the HTML
  document.getElementById("root")
);
