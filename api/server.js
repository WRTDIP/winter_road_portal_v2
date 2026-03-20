import express from "express"
import cors from "cors"
import weather from "./routes/weather.route.js"
import login from "./routes/login.route.js"
import user from "./routes/user.route.js"
import dev from "./routes/dev.route.js"
import register from "./routes/register.route.js"
const port = 4000
const app = express()
app.use(cors())
app.use(express.json())

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
