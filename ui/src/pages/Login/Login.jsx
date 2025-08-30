import { Container } from "react-bootstrap"
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner"
import LoginForm from "../../components/Login/Login"
import * as React from "react"
import { Box } from "@mui/material"
import { Grid2 } from "@mui/material"
import { Divider } from "@mui/material"
import { TextField } from "@mui/material"
import { CheckIcon, ErrorOutlineIcon } from "@mui/icons-material"
import { Typography, Button, Alert } from "@mui/material"
import { useState, useEffect } from "react"
import bcrypt from "bcryptjs"
import { registerUser } from "../../services/user.service"

function Login() {
  const [name, setName] = useState("")
  const [utorid, setUtorid] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [alertSeverity, setAlertSeverity] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const [alertVisible, setAlertVisible] = useState(true)

  const handleRegister = async () => {
    const res = await registerUser(name, utorid, email, password)
    console.log(res)

    if (res.success) {
      setAlertSeverity("success")
    } else {
      setAlertSeverity("error")
    }
    setAlertVisible(true)
    setAlertMessage(res.message)
  }

  return (
    <Container className="p-0" fluid>
      <Typography variant="h1" align="center" mb={"10vh"}>
        Accounts
      </Typography>
      <Grid2 container>
        <Grid2 size={5.9}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box mb={2}>
              <Typography variant="h2" align="center">
                Login
              </Typography>
            </Box>
            <Box m={1}>
              <TextField label="Email" variant="filled" />
            </Box>
            <Box>
              <TextField label="Password" variant="filled" />
            </Box>
            <Box m={1}>
              <Button>Forgot Password</Button>
            </Box>
            <Box m={1}>
              <Button variant="contained">Login</Button>
            </Box>
          </Box>
        </Grid2>
        <Grid2 size={0.1}>
          <Divider orientation="vertical" />
        </Grid2>
        <Grid2 size={5}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box mb={2}>
              <Typography variant="h2" align="center">
                Register
              </Typography>
            </Box>
            <Box m={1}>
              <TextField
                label="Name"
                variant="filled"
                onChange={(e) => setName(e.target.value)}
              />
            </Box>
            <Box m={1}>
              <TextField
                label="Utorid"
                variant="filled"
                onChange={(e) => setUtorid(e.target.value)}
              />
            </Box>
            <Box m={1}>
              <TextField
                label="Email"
                variant="filled"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>
            <Box>
              <TextField
                label="Password"
                variant="filled"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Box>
            <Box m={1}>
              <Button onClick={handleRegister}>Register</Button>
            </Box>
          </Box>
          <Alert
            sx={{ visibility: alertVisible ? "visible" : "hidden" }}
            severity={alertSeverity}
            onClose={() => {
              setAlertVisible(false)
            }}
          >
            {alertMessage}
          </Alert>
        </Grid2>
      </Grid2>
      {/* <LoginForm /> */}
    </Container>
  )
}

export default Login
