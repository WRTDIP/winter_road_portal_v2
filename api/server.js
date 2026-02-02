const express = require("express")
const cors = require("cors")
const weather = require("./routes/weather.route")
const port = process.env.PORT || 4000
const app = express()

app.use(cors({
  origin: process.env.DEPLOYMENT === 'prod' ? 'https://wramp.ca' : '*'
}))
app.use(express.json())

// Logging middleware
const logging = (req, res, next) => {
  console.log(Date().toLocaleString("en-US"), " URL", req.path)
  next()
}
app.use(logging)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Routes
app.use("/weather", weather)

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`)
})
