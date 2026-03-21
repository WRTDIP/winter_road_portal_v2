import {Button,Form} from 'react-bootstrap';
import {useState} from "react";
import "./styles.css"

function AlertDismissible(props) {
    if (props.show) {
        return (
            <Alert className="mt-3" variant={props.variant} onClose={() => props.setShow(false)} dismissible>
                <Alert.Heading>{props.dialogHeading}</Alert.Heading>
                <p>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.dialogMessage) }} />
                </p>
            </Alert>
        );
    }
  return <></>;
}


function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [dialogHeading, setDialogHeading] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [variant, setVariant] = useState("danger");


  const validateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorHeading("Invalid Email");
      setErrorMessage("Please enter a valid email address.");
      setShowAlert(true);
      return false;
    } else {
      setShowAlert(false);
      return true;
    }
  }

  const validatePassword = (pwd, confirmPwd) => {
    if (!pwd || pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      setErrorHeading("Invalid Password");
      setErrorMessage("Password must be at least 8 characters and include letters and numbers.");
      setShowAlert(true);
      return false;
    }
    if (typeof confirmPwd !== "undefined" && pwd !== confirmPwd) {
      setErrorHeading("Password Mismatch");
      setErrorMessage("Password and confirmation do not match.");
      setShowAlert(true);
      return false;
    }
    setShowAlert(false);
    return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email) || !validatePassword(password)) {
        setVariant("danger");
        setDialogHeading("Login Error");
        setDialogMessage("Invalid email address and/or password. Please verify your credentials and try again.");
        setShowAlert(true);
        return;
    }

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status === "error") {
            setVariant("danger");
            setDialogHeading("Login Failed");
            setDialogMessage(data.message);
            setShowAlert(true);
        } else if (data.status === "success") {
            setVariant("success");
            setDialogHeading("Login Successful");
            setDialogMessage(data.message);
            setDialogMessage(`${data.message} <div class="mt-3"><a href="/register" class="btn btn-primary btn-lg rounded-pill shadow-sm" role="button" style="text-decoration:none;color:#fff;">Create an account</a></div>`);
            setShowAlert(true);
            setTimeout(() => { 
            window.location.href = "/dashboard"; // Example redirect
            }, 2000);
        }

    })
    .catch((err) => console.error(err));
  };
  
    return (
      <Form className="loginForm" onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
      <Form.Label className="h3 pb-3">Email address</Form.Label>
      <Form.Control
      type="email"
      placeholder="Enter email"
      onChange={(e) => {
        setEmail(e.target.value);
      }}
      />
      </Form.Group>

      <Form.Group className="mb-3">
      <Form.Label className="h3 pb-3">Password</Form.Label>
      <Form.Control
      type="password"
      placeholder="Password"
      onChange={(e) => {
        setPassword(e.target.value);
      }}
      />
      </Form.Group>

      <Button
      variant="outline-primary"
      className="mt-3 w-100 rounded-pill shadow-sm"
      style={{ textTransform: 'none', fontWeight: 600 }}
      type="submit"
      onClick={handleSubmit}
      >
      Login
      </Button>

      <Button
      variant="outline-primary"
      className="mt-3 w-100 rounded-pill shadow-sm"
      style={{ textTransform: 'none', fontWeight: 600 }}
      onClick={() => window.location.href = '/register'}
      >
      Create an account
      </Button>

      <AlertDismissible
      className="mt-3"
      show={showAlert}
      setShow={setShowAlert}
      variant={variant}
      dialogHeading={dialogHeading}
      dialogMessage={dialogMessage}
      />
      
      </Form>
    );
}

export default LoginForm;