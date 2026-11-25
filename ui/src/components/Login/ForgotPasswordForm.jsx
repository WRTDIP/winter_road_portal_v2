import { useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";
import "./styles.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ variant: "danger", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    if (!EMAIL_PATTERN.test(email.trim())) {
      setNotice({ variant: "danger", message: "Enter a valid email address, for example name@example.com." });
      return;
    }
    setSubmitting(true);
    setNotice({ variant: "danger", message: "" });
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json().catch(() => ({}));
      setNotice(response.ok
        ? { variant: "success", message: result.message || "Check your email for a link to reset your password." }
        : { variant: "danger", message: result.message || "Unable to send a reset email right now. Please try again." });
    } catch {
      setNotice({ variant: "danger", message: "We could not reach the server. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="authShell">
      <Form className="loginForm" onSubmit={handleSubmit} noValidate>
        <div className="authHeader">
          <h2 className="authTitle">Reset your password</h2>
          <p className="authSubtitle">Enter your account email and we will send you a link to choose a new password.</p>
        </div>

        <Form.Group className="mb-3" controlId="forgotEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="name@example.com"
            value={email}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </Form.Group>

        <div className="authActions">
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" aria-hidden="true" /> : <MailOutlined aria-hidden="true" />}
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
          <div className="authDivider">or</div>
          <Button variant="outline-primary" as={Link} to="/login">
            Back to sign in
          </Button>
        </div>

        {notice.message && (
          <Alert className="authAlert" variant={notice.variant} role={notice.variant === "danger" ? "alert" : "status"}>
            {notice.message}
          </Alert>
        )}
      </Form>
    </div>
  );
}
