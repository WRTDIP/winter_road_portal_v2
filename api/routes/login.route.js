import express from "express";
import { prisma } from "../lib/prisma.js";
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user.password !== hashedPassword) {
      return res.status(401).json({ status: "error", message: "Invalid email or password." });
    }

    req.session.userId = user.id; 
    req.session.email = user.email;
    req.session.userlevel = user.userlevel;

    return res.json({ status: "success", message: "Login successful." });
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
    return res.json({ status: "success", message: "Logout successful" });
  });
});


export default router
