const express = require("express")
const router = express.Router()
const { getUsers } = require("../controllers/user.controller")

// router.post("/userLogin", findUser);
// router.post("/create", createUser);
// router.get("/", (req, res) => {
//   res.send("WeatherTest2")
// })

// router.post("/users", getUsers);
// router.get("/test", (req, res) => {
//   console.log(req.body);
//   res.send("Test successful");
// });

module.exports = router
