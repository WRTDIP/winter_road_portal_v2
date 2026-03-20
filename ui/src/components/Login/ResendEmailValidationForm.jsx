import { Button, Form, Alert } from 'react-bootstrap';
import { useState } from "react";
import "./styles.css"
import DOMPurify from 'dompurify';
import { Typography } from 'antd';


function AlertDismissible(props) {
    if (props.show) {
        return (
            <Alert
            className="mt-3"
            variant={props.variant}
            onClose={() => props.setShow(false)}
            dismissible
            >
            <Alert.Heading>{props.dialogHeading}</Alert.Heading>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.dialogMessage) }} />
            </Alert>
        );
    }
  return <></>;
}

function ResendEmailValidationForm() {
    const [email, setEmail] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [dialogHeading, setDialogHeading] = useState("");
    const [dialogMessage, setDialogMessage] = useState("");
    const [variant, setVariant] = useState("danger");


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


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
        return;
    }

    setShowAlert(true);
    setVariant("danger");
    fetch("/api/register/resend-validation-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status === "error") {
            setVariant("danger");
            setDialogHeading("Resend Email Failed");
            setDialogMessage(data.message);
            setShowAlert(true);
        } 

        if (data.status === "success") {
            setVariant("success");
            setDialogHeading("Resend Email Successful");
            setDialogMessage(data.message);
            setShowAlert(true);
        } 
    })
    .catch((err) => {console.error(err); 
        setDialogHeading("Resend Email Failed");
        setDialogMessage(`An error occurred during resending the email. Please try again. ${err}`);
        setShowAlert(true);
    });
  };
  
    return (
        <Form className="registerForm" onSubmit={handleSubmit}>

            <Form.Group className="mb-3">
                <Form.Label className="h5 pb-1">Email address</Form.Label>
                <Typography variant="p" className="mb-2">
                Please enter your email address to resend the validation email.
                </Typography>
                <Form.Control
                    type="email"
                    placeholder="Enter email"
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                />
            </Form.Group>

            <Button className="mt-3" variant="primary" type="submit" onClick={handleSubmit}>
                Resend
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

export default ResendEmailValidationForm;