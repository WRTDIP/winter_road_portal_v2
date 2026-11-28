import express from "express"
import cors from "cors"
import weather from "./routes/weather.route.js"
import { createAuth0Router } from "./routes/auth0.route.mjs"
import { createAuthRouter } from "./routes/auth.route.mjs"
import { prisma } from "./lib/prisma.js"
import dev from "./routes/dev.route.js"
const port = 4000
const app = express()
app.use(cors())
app.use(express.json())

app.set('trust proxy', 1);

// Logging
const logging = (req, res, next) => {
  console.log(Date().toLocaleString("en-US"), " URL", req.path)
  next()
}
 
app.use(logging)

app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded

//Routes
app.use("/api/weather", weather)
app.use("/api/dev", dev)
app.use("/api/user", createAuth0Router({ prisma }))
app.use("/api/auth", createAuthRouter({}))

//Start
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
