import { Button, Form, Alert } from 'react-bootstrap';
import { useState } from "react";
import "./styles.css"
import DOMPurify from 'dompurify';



function AlertDismissibleExample(props) {
    if (props.show) {
        return (
            <Alert className="mt-3" variant="danger" onClose={() => props.setShow(false)} dismissible>
                <Alert.Heading>{props.errorHeading}</Alert.Heading>
                <p>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.errorMessage) }} />
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
  const [errorHeading, setErrorHeading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const validateFullName = (name) => {
    const nameParts = name.trim().split(" ");
    if (!/^[a-zA-Z]+\s[a-zA-Z]+$/.test(name.trim())) {
        setErrorHeading("Invalid Full Name");
        setErrorMessage("Please enter your full name (first and last name).");
        setShowAlert(true);
        return false;
    } else {
        setShowAlert(false);
        return true;
    }
  }

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

    if(!validateFullName(fullName) || !validateEmail(username) || !validatePassword(password, confirmPassword)) {
        return;
    }

    setShowAlert(true);
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
            setErrorHeading("Registration Failed");
            setErrorMessage(data.message);
            setShowAlert(true);
        } 

        if (data.status === "success") {
            
            // setErrorHeading("Registration Successful");
            // setErrorMessage(data.message);
            // setShowAlert(true);
        } 
    })
    .catch((err) => {console.error(err); 
        setErrorHeading("Registration Failed");
        setErrorMessage(`An error occurred during registration. Please try again. ${err}`);
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

            <Button className="mt-3" variant="primary" type="submit" onClick={handleSubmit}>
                Submit
            </Button>

            <AlertDismissibleExample
                className="mt-3"
                show={showAlert}
                setShow={setShowAlert}
                errorHeading={errorHeading}
                errorMessage={errorMessage}
            />
        </Form>
    );
}

export default RegisterForm;