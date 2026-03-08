import express from "express";
import { createUser, findUser, getUsers } from "../controllers/users.js";

let router = express.Router();

router.post("/userLogin", findUser);
router.post("/create", createUser);
router.post("/users", getUsers);

export default router;
