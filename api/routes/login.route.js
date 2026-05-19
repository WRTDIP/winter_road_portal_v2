import express from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
const router = express.Router();
// const { getUsers } = require("../controllers/user.controller")

// router.post("/userLogin", findUser);
// router.post("/create", createUser);
router.post("/", async (req, res) => {
  
  const { email, password } = req.body;
  console.log("Received login request with email:", email);
  console.log("Received login request with password:", password);

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      }
    })

    if (!user){
      return res.status(401).json({ status: "error", message: "User doesn't exist please register." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid email or password." });
    }

    req.session.userId = user.id; 
    req.session.email = user.email;
    req.session.userlevel = user.userlevel;

    req.session.regenerate((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Session regeneration error" });
      }
      console.log("User logged in successfully:", user.email);
      return res.status(200).json({ status: "success", message: "Login successful." });
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }

})

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ status: "success", message: "Logout successful" });
  });
});


export default router
