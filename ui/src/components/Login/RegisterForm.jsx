import { Button, Form, Alert } from 'react-bootstrap';
import { useState } from "react";
import "./styles.css"


function AlertDismissibleExample(props) {
    if (props.show) {
        return (
            <Alert className="mt-3" variant="danger" onClose={() => props.setShow(false)} dismissible>
                <Alert.Heading>{props.errorHeading}</Alert.Heading>
                <p>
                    {props.errorMessage}
                </p>
            </Alert>
        );
    }
  return <></>;
}

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [errorHeading, setErrorHeading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const handleSubmit = (e) => {
    e.preventDefault();
    setShowAlert(true);
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username,
        password: password,
      }),
    })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => {console.error(err); 
        setErrorHeading("Registration Failed");
        setErrorMessage(`An error occurred during registration. Please try again. ${err}`);
        setShowAlert(true);
    });
  };
  
    return (
        <Form className="loginForm" onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label className="h3 pb-3">Email address</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Enter email"
                    onChange={(e) => {
                        setUsername(e.target.value);
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

            <Form.Group className="mb-3">
                <Form.Label className="h3 pb-3">Confirm Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Password"
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                    }}
                />
            </Form.Group>

            <Button className="mt-3" variant="primary" type="submit">
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