import { useEffect, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleOutlined, LoginOutlined, UserAddOutlined, WindowsOutlined } from "@ant-design/icons";
import { useAccount } from "../Auth0/AccountProvider";
import "./styles.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Continue with Google", Icon: GoogleOutlined },
  { id: "microsoft", label: "Continue with Microsoft", Icon: WindowsOutlined },
];

const SOCIAL_ERRORS = {
  social_cancelled: "Sign in was cancelled. Choose a sign in option to try again.",
  social_denied: "That account is not allowed to sign in here. Try another account or sign in with your email and password.",
  social_expired: "Your sign in attempt expired or could not be verified. Please try again.",
  social_failed: "We could not sign you in with that account. Please try again or use your email and password.",
  social_unavailable: "That sign in option is not available right now. Please use your email and password.",
};

export default function AuthForm({ signup = false }) {
  const { isAuthenticated, error: accountError, login, signup: register } = useAccount();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const redirectError = SOCIAL_ERRORS[searchParams.get("error")] || "";

  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then((result) => active && setProviders(Array.isArray(result.data) ? result.data : []))
      .catch(() => active && setProviders([]));
    return () => { active = false; };
  }, []);

  const socialOptions = SOCIAL_PROVIDERS.filter((provider) => providers.includes(provider.id));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errorVariant, setErrorVariant] = useState("danger");

  if (isAuthenticated && !submitting) return <Navigate to="/dashboard" replace />;

  function validate() {
    if (signup && !name.trim()) return "Enter your full name.";
    if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address, for example name@example.com.";
    if (!password) return "Enter your password.";
    if (signup && password !== confirmPassword) return "Password and confirmation do not match.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const problem = validate();
    setError(problem);
    setErrorVariant("danger");
    if (problem) return;
    setSubmitting(true);
    try {
      if (signup) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (failure) {
      setError(failure.message || "Unable to sign in. Please try again.");
      setErrorVariant(failure.accountCreated ? "info" : "danger");
      setSubmitting(false);
    }
  }

  return (
    <div className="authShell">
      <Form className={signup ? "registerForm" : "loginForm"} onSubmit={handleSubmit} noValidate>
        <div className="authHeader">
          <h2 className="authTitle">{signup ? "Create your account" : "Sign in to your account"}</h2>
          <p className="authSubtitle">
            {signup ? "We will email you a link to verify your address." : "Access saved data, downloads, and portal tools."}
          </p>
        </div>

        {signup && (
          <Form.Group className="mb-3" controlId="registerFullName">
            <Form.Label>Full name</Form.Label>
            <Form.Control
              type="text"
              placeholder="First and last name"
              value={name}
              autoComplete="name"
              required
              onChange={(event) => setName(event.target.value)}
            />
          </Form.Group>
        )}

        <Form.Group className="mb-3" controlId={signup ? "registerEmail" : "loginEmail"}>
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

        <Form.Group className="mb-3" controlId={signup ? "registerPassword" : "loginPassword"}>
          <Form.Label>Password</Form.Label>
          <div className="authPasswordField">
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder={signup ? "Create a password" : "Enter your password"}
              value={password}
              autoComplete={signup ? "new-password" : "current-password"}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="authToggle"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Form.Group>

        {signup && (
          <Form.Group className="mb-3" controlId="registerConfirmPassword">
            <Form.Label>Confirm password</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              autoComplete="new-password"
              required
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </Form.Group>
        )}

        <div className="authActions">
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting
              ? <Spinner animation="border" size="sm" aria-hidden="true" />
              : signup ? <UserAddOutlined aria-hidden="true" /> : <LoginOutlined aria-hidden="true" />}
            {submitting
              ? (signup ? "Creating account…" : "Signing in…")
              : (signup ? "Create account" : "Sign in")}
          </Button>
          <div className="authDivider">or</div>
          {socialOptions.map(({ id, label, Icon }) => (
            <Button key={id} variant="outline-secondary" href={`/api/auth/social/${id}`} disabled={submitting}>
              <Icon aria-hidden="true" />
              {label}
            </Button>
          ))}
          <Button variant="outline-primary" as={Link} to={signup ? "/login" : "/register"}>
            {signup ? "Back to sign in" : "Create an account"}
          </Button>
        </div>

        {!signup && (
          <div className="authFooterLinks">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
        )}

        {error && <Alert className="authAlert" variant={errorVariant} style={{ whiteSpace: "pre-line" }}>{error}</Alert>}
        {!error && (redirectError || accountError) && (
          <Alert className="authAlert" variant={searchParams.get("error") === "social_cancelled" ? "info" : "danger"}>
            {redirectError || accountError}
          </Alert>
        )}
      </Form>
    </div>
  );
}
