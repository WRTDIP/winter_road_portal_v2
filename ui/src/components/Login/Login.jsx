import {Button, Form, Alert, Spinner} from 'react-bootstrap';
import {useState} from "react";
import {Link} from "react-router-dom";
import "./styles.css"
import DOMPurify from 'dompurify';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AlertDismissible(props) {
    if (props.show) {
        return (
            <Alert className="authAlert" variant={props.variant} onClose={() => props.setShow(false)} dismissible>
                <Alert.Heading>{props.dialogHeading}</Alert.Heading>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.dialogMessage) }} />
            </Alert>
        );
    }
  return <></>;
}


function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [dialogHeading, setDialogHeading] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [variant, setVariant] = useState("danger");

  const showMessage = (nextVariant, heading, message) => {
    setVariant(nextVariant);
    setDialogHeading(heading);
    setDialogMessage(message);
    setShowAlert(true);
  }

  const validate = () => {
    const errors = { email: "", password: "" };

    if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = "Enter a valid email address, for example name@example.com.";
    }

    if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = "Password must be at least 8 characters and include letters and numbers.";
    }

    setFieldErrors(errors);
    return !errors.email && !errors.password;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (submitting) {
        return;
    }

    if (!validate()) {
        showMessage("danger", "Login Error", "Invalid email address and/or password. Please verify your credentials and try again.");
        return;
    }

    setShowAlert(false);
    setSubmitting(true);

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status === "error") {
            showMessage("danger", "Login Failed", data.message);
        } else if (data.status === "success") {
            showMessage("success", "Login Successful", data.message);
        }
    })
    .catch((err) => {
        console.error(err);
        showMessage("danger", "Login Failed", "We could not reach the server. Please check your connection and try again.");
    })
    .finally(() => setSubmitting(false));
  };
  
    return (
      <div className="authShell">
      <Form className="loginForm" onSubmit={handleSubmit} noValidate>
      <div className="authHeader">
      <h2 className="authTitle">Sign in to your account</h2>
      <p className="authSubtitle">Access saved data, downloads, and portal tools.</p>
      </div>

      <Form.Group className="mb-3" controlId="loginEmail">
      <Form.Label>Email address</Form.Label>
      <Form.Control
      type="email"
      placeholder="name@example.com"
      value={email}
      autoComplete="email"
      inputMode="email"
      autoCapitalize="none"
      spellCheck="false"
      required
      isInvalid={Boolean(fieldErrors.email)}
      onChange={(e) => {
        setEmail(e.target.value);
        setFieldErrors((prev) => ({ ...prev, email: "" }));
      }}
      />
      <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="loginPassword">
      <Form.Label>Password</Form.Label>
      <div className="authPasswordField">
      <Form.Control
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      autoComplete="current-password"
      required
      isInvalid={Boolean(fieldErrors.password)}
      onChange={(e) => {
        setPassword(e.target.value);
        setFieldErrors((prev) => ({ ...prev, password: "" }));
      }}
      />
      <button
      type="button"
      className="authToggle"
      aria-pressed={showPassword}
      aria-label={showPassword ? "Hide password" : "Show password"}
      onClick={() => setShowPassword((prev) => !prev)}
      >
      {showPassword ? "Hide" : "Show"}
      </button>
      <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
      </div>
      <span className="authHint">At least 8 characters, including letters and numbers.</span>
      </Form.Group>

      <div className="authActions">
      <Button variant="primary" type="submit" disabled={submitting}>
      {submitting && <Spinner animation="border" size="sm" role="status" aria-hidden="true" />}
      {submitting ? "Signing in\u2026" : "Sign in"}
      </Button>

      <div className="authDivider">or</div>

      <Button variant="outline-primary" as={Link} to="/register">
      Create an account
      </Button>
      </div>

      <div className="authFooterLinks">
      <Link to="/resend-email-validation">Resend verification email</Link>
      </div>

      <AlertDismissible
      show={showAlert}
      setShow={setShowAlert}
      variant={variant}
      dialogHeading={dialogHeading}
      dialogMessage={dialogMessage}
      />

      </Form>
      </div>
    );
}

export default LoginForm;