const express = require("express")
const cors = require("cors")
const weather = require("./routes/weather.route")
const port = 4000
const app = express()
app.use(cors({
  origin: process.env.DEPLOYMENT === 'prod' ? 'https://wramp.ca' : '*'
}))
app.use(express.json())

// Logging
const logging = (req, res, next) => {
  console.log(Date().toLocaleString("en-US"), " URL", req.path)
  next()
}
app.use(logging)

//Routes
app.use("/weather", weather)

//Start
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
