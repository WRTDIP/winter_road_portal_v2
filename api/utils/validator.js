function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/
  return passwordRegex.test(password)
}

function isValidName(name) {
  const nameRegex = /^[A-Za-z]{2,}(?: [A-Za-z]{2,})*$/
  return nameRegex.test(name)
}

function isValidUtorid(utorid) {
  const utoridRegex = /^[a-zA-Z][a-zA-Z0-9]{2,9}$/
  return utoridRegex.test(utorid)
}

module.exports = { isValidEmail, isValidPassword, isValidName, isValidUtorid }
