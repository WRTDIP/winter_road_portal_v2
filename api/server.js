import express from "express"
import cors from "cors"
import weather from "./routes/weather.route.js"
import login from "./routes/login.route.js"
import user from "./routes/user.route.js"
import dev from "./routes/dev.route.js"
import register from "./routes/register.route.js"
import session from "express-session"
const port = 4000
const app = express()
app.use(cors())
app.use(express.json())

app.set('trust proxy', 1);

app.use(session({
  secret: 'wrampsecretesigningid', // Used to sign the session ID cookie
  resave: false,                 // Prevents the session from being resaved to the store if it hasn't changed
  saveUninitialized: false,      // Prevents uninitialized sessions from being saved
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Ensures cookies are only sent over HTTPS in production
    httpOnly: true,              // Prevents client-side JavaScript from accessing the cookie
    maxAge: 1000 * 60 * 60 * 24  // Cookie expiration time in milliseconds (e.g., 1 day)
  }
}));

// Logging
const logging = (req, res, next) => {
  console.log(Date().toLocaleString("en-US"), " URL", req.path)
  next()
}
 
app.use(logging)

app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded

//Routes
app.use("/api/weather", weather)
app.use("/api/login", login)
app.use("/api/dev", dev)
app.use("/api/user", user)
app.use("/api/register", register)

//Start
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
