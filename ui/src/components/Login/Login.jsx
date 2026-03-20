import {Button,Form} from 'react-bootstrap';
import {useState} from "react";
import "./styles.css"

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/login", {
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
        <Button className="mt-3" variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    );
}

export default LoginForm;