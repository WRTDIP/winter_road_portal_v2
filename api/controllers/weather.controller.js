const express = require("express")

const getClimateCity = async (req, res) => {
  console.log("Get City")
  try {
    const cityCode = req.query.citycode
    if (cityCode) {
      return res.json({ cityCode: cityCode })
    }
    return res.status(400).json({ error: "Missing params" })
  } catch (error) {
    console.error(error.toString())
    return res.status(400).json({ error: error.toString() })
  }
}

module.exports = { getClimateCity }
