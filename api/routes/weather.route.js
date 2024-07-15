const express = require("express")
const router = express.Router()
const { getClimateCity } = require("../controllers/weather.controller")

// define the home page route
router.get("/", (req, res) => {
  res.send("WeatherTest1")
})
// define the about route
router.get("/about", (req, res) => {
  res.send("WeatherTest2")
})

router.get("/city", getClimateCity)

module.exports = router
