const express = require("express")
const router = express.Router()
// const { getUsers } = require("../controllers/user.controller")

// router.post("/userLogin", findUser);
// router.post("/create", createUser);
router.post("/", (req, res) => {
  console.log(req.body);
  res.send("You are using the login route")
})

router.post("/testjson", (req, res) => {
  const data = req.body;
  console.log(data);
  res.send("Test successful");
});


module.exports = router
