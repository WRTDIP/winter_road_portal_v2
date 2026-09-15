import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css"
import DOMPurify from 'dompurify';



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


function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [dialogHeading, setDialogHeading] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [variant, setvariant] = useState("danger");
  const [buttonTimeout, setButtonTimeout] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const validateFullName = (name) => {
    const nameParts = name.trim().split(" ");
    if (!/^[a-zA-Z]+\s[a-zA-Z]+$/.test(name.trim())) {
        setDialogHeading("Invalid Full Name");
        setDialogMessage("Please enter your full name (first and last name).");
        setShowAlert(true);
        return false;
    } else {
        setShowAlert(false);
        return true;
    }
  }

  const validateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setDialogHeading("Invalid Email");
      setDialogMessage("Please enter a valid email address.");
      setShowAlert(true);
      return false;
    } else {
      setShowAlert(false);
      return true;
    }
  }

  const validatePassword = (pwd, confirmPwd) => {
    if (!pwd || pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      setDialogHeading("Invalid Password");
      setDialogMessage("Password must be at least 8 characters and include letters and numbers.");
      setShowAlert(true);
      return false;
    }
    if (typeof confirmPwd !== "undefined" && pwd !== confirmPwd) {
      setDialogHeading("Password Mismatch");
      setDialogMessage("Password and confirmation do not match.");
      setShowAlert(true);
      return false;
    }
    setShowAlert(false);
    return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if(buttonTimeout) {
        setDialogHeading("Please Wait");
        setDialogMessage("Your previous registration attempt is still being processed. Please wait a moment before trying again.");
        setShowAlert(true);
        return;
    }

    if(!validateFullName(fullName) || !validateEmail(username) || !validatePassword(password, confirmPassword)) {
        return;
    }

    setShowAlert(true);
    setButtonTimeout(true);
    setTimeout(() => setButtonTimeout(false), 2000); // Disable button for 10 seconds to prevent spamming
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: fullName,
        email: username,
        password: password,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status === "error") {
            setvariant("danger");
            setDialogHeading("Registration Failed");
            setDialogMessage(data.message);
            setShowAlert(true);
        } 

        if (data.status === "success") {
            setvariant("success");
            setDialogHeading("Registration Successful");
            setDialogMessage(data.message);
            setShowAlert(true);
        } 
    })
    .catch((err) => {console.error(err); 
        setDialogHeading("Registration Failed");
        setDialogMessage(`An error occurred during registration. Please try again. ${err}`);
        setShowAlert(true);
    });
  };
  
    return (
        <div className="authShell">
        <Form className="registerForm" onSubmit={handleSubmit} noValidate>
            <div className="authHeader">
                <h2 className="authTitle">Create your account</h2>
                <p className="authSubtitle">We will email you a verification code to finish setting up.</p>
            </div>

            <Form.Group className="mb-3" controlId="registerFullName">
                <Form.Label>Full name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="First and last name"
                    value={fullName}
                    autoComplete="name"
                    required
                    onChange={(e) => {
                        setFullName(e.target.value);
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    value={username}
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck="false"
                    required
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerPassword">
                <Form.Label>Password</Form.Label>
                <div className="authPasswordField">
                    <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        autoComplete="new-password"
                        required
                        onChange={(e) => {
                            setPassword(e.target.value);
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
                </div>
                <span className="authHint">At least 8 characters, including letters and numbers.</span>
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerConfirmPassword">
                <Form.Label>Confirm password</Form.Label>
                <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    autoComplete="new-password"
                    required
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                    }}
                />
            </Form.Group>

            <div className="authActions">
                <Button variant="primary" type="submit" disabled={buttonTimeout}>
                    {buttonTimeout && <Spinner animation="border" size="sm" role="status" aria-hidden="true" />}
                    {buttonTimeout ? "Creating account\u2026" : "Create account"}
                </Button>

                <div className="authDivider">or</div>

                <Button variant="outline-primary" as={Link} to="/login">
                    Back to sign in
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

export default RegisterForm;