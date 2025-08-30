const express = require("express")
const router = express.Router()
const {
  listUsers,
  createUser,
  loginUser,
} = require("../controllers/user.controller.js")

// router.post("/userLogin", findUser)
router.post("/register", createUser)
router.post("/login", loginUser)
router.get("/list", listUsers)

module.exports = router
