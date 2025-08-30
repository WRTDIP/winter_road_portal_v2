/**
 * Logins user in the database
 * @param {String} name
 * @param {String} utorid
 * @param {String} email
 * @param {password} password
 * @return {Object} Containing observations, forecasts, and more
 */
export const registerUser = async (name, utorid, email, password) => {
  console.log("registerUser", { name, utorid, email, password })
  console.log(
    "Json stringfy",
    JSON.stringify({ name, utorid, email, password })
  )
  return await fetch(`http://localhost:4000/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, utorid, email, password }),
  }).then((r) => r.json())
}
