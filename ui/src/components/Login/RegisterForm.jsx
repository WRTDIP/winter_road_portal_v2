import { Button, Form, Alert } from 'react-bootstrap';
import { useState } from "react";
import "./styles.css"
import DOMPurify from 'dompurify';



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
        <Form className="registerForm" onSubmit={handleSubmit}>
           <Form.Group className="mb-3">
                <Form.Label className="h5 pb-3">Full Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    onChange={(e) => {
                        setFullName(e.target.value);
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label className="h5 pb-3">Email address</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Enter email"
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label className="h5 pb-3">Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Enter password"
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label className="h5 pb-3">Confirm Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                    }}
                />
            </Form.Group>

            <Button
                variant="outline-primary"
                className="mt-3 w-100 rounded-pill shadow-sm"
                style={{ textTransform: 'none', fontWeight: 600 }}
                type="submit"
            >
                Submit
            </Button>

            <Button
                variant="outline-primary"
                className="mt-3 w-100 rounded-pill shadow-sm"
                style={{ textTransform: 'none', fontWeight: 600 }}
                onClick={() => window.location.href = '/login'}
            >
                Back to Login
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

export default RegisterForm;