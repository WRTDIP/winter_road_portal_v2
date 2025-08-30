const {
  dbGetUsers,
  dbCreateUser,
  dbUserExists,
  dbFindUserByEmail,
  dbFindUserByUtorid,
} = require("../repository/user.repository.js")
const {
  isValidEmail,
  isValidUtorid,
  isValidPassword,
  isValidName,
} = require("../utils/validator.js")
const bcrypt = require("bcryptjs")

const createUser = async (req, res) => {
  const { name, email, utorid, password } = req.body

  if (!isValidName(name))
    return res.status(500).json({ success: false, message: "Invalid Name" })
  if (!isValidEmail(email))
    return res.status(500).json({ success: false, message: "Invalid Email" })
  if (!isValidUtorid(utorid))
    return res.status(500).json({ success: false, message: "Invalid Utorid" })
  if (!isValidPassword(password))
    return res.status(500).json({ success: false, message: "Invalid Password" })

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const [usersWithEmail, usersWithUtorid] = await Promise.all([
      dbFindUserByEmail(email),
      dbFindUserByUtorid(utorid),
    ])

    // console.log("users with email " + usersWithEmail.length)
    // console.log("users with utorid " + usersWithUtorid.length)

    const emailExists = usersWithEmail.length > 0
    const utoridExists = usersWithUtorid.length > 0

    if (emailExists || utoridExists) {
      let message = ""

      if (emailExists) message += "Email already registered to an account. "
      if (utoridExists) message += "Utorid already registered to an account."

      message += "If this is your account try to reset your password."

      // Trim any trailing spaces in the message
      message = message.trim()

      return res.status(409).json({
        success: false,
        message,
        error: message,
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Failed to check user existence",
      error: error.message,
    })
  }

  try {
    await dbCreateUser({
      name,
      email,
      utorid,
      password: hashedPassword,
    })
    res.status(200).json({ success: true, message: "created user" })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    })
  }
}

const listUsers = async (req, res) => {
  return res.json(await dbGetUsers())
}

const loginUser = async (req, res) => {
  return { success: true, message: "To be built!" }
}

module.exports = { listUsers, createUser, loginUser }
