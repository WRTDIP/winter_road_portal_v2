const express = require("express")
const cors = require("cors")
const weather = require("./routes/weather.route")
const login = require("./routes/login.route")
const user = require("./routes/user.route")
const dev = require("./routes/dev.route")
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

//Routes
app.use("/api/weather", weather)
app.use("/api/login", login)
app.use("/api/dev", dev)

//Start
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
