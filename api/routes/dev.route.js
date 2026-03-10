const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("You are using the dev route.");
});


module.exports = router;
