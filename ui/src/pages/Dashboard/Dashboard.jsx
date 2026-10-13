import { useState } from "react";
import { Alert, Badge, Button, Container, Spinner } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { LogoutOutlined, ReloadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import { useAccount } from "../../components/Auth0/AccountProvider";
import "./styles.css";

function formatDate(value, includeTime = false) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long", ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
}

export default function Dashboard() {
  const { account, error, retry, isAuthenticated, isLoading, logout } = useAccount();
  const [logoutError, setLogoutError] = useState("");

  if (!isLoading && !isAuthenticated) return <Navigate to="/login" replace />;

  async function signOut() {
    try {
      await logout();
    } catch (failure) {
      setLogoutError("Unable to sign out. Please try again.");
    }
  }

  return (
    <Container className="p-0" fluid>
      <CoverBanner title="Dashboard" />
      <section className="accountDashboard" aria-labelledby="account-heading">
        <div className="accountDashboardHeader">
          <h2 id="account-heading">Your account</h2>
          {isAuthenticated && (
            <Button variant="outline-secondary" onClick={signOut}>
              <LogoutOutlined aria-hidden="true" /> Sign out
            </Button>
          )}
        </div>
        {logoutError && <Alert variant="danger">{logoutError}</Alert>}
        {error ? (
          <Alert variant="danger">
            <p>{error}</p>
            <Button variant="outline-danger" onClick={retry}><ReloadOutlined aria-hidden="true" /> Try again</Button>
          </Alert>
        ) : isLoading || !account ? (
          <div className="accountLoading" role="status">
            <Spinner animation="border" size="sm" aria-hidden="true" /> Loading your account...
          </div>
        ) : (
          <>
            <dl className="accountDetails">
              <div><dt>Name</dt><dd>{account.name || "Not provided"}</dd></div>
              <div><dt>Email address</dt><dd>{account.email}</dd></div>
              <div><dt>Member since</dt><dd>{formatDate(account.datecreated)}</dd></div>
              <div><dt>Last portal access</dt><dd>{formatDate(account.dateloggedin, true)}</dd></div>
              <div>
                <dt>Email status</dt>
                <dd><Badge bg={account.emailverified ? "success" : "warning"} text={account.emailverified ? "light" : "dark"}>
                  {account.emailverified ? "Verified" : "Awaiting verification"}
                </Badge></dd>
              </div>
            </dl>
            {!account.emailverified && <Alert variant="info">Your email is not verified. Check your inbox for the verification email, then sign out and sign in again.</Alert>}
            <div className="accountDashboardActions">
              <Button as={Link} to="/map" variant="primary"><EnvironmentOutlined aria-hidden="true" /> Open map</Button>
            </div>
          </>
        )}
      </section>
    </Container>
  );
}