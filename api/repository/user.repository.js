const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const dbCreateUser = async (user) => {
  return await prisma.user.create({
    data: user,
  })
}

const dbGetUsers = async () => {
  return await prisma.user.findMany()
}

const dbUserExists = async (email, utorid) => {
  return await prisma.user.findMany({
    where: {
      OR: [{ email }, { utorid }],
    },
  })
}

const dbFindUserByEmail = async (email) => {
  return await prisma.user.findMany({
    where: { email },
  })
}
const dbFindUserByUtorid = async (utorid) => {
  return await prisma.user.findMany({
    where: { utorid },
  })
}

module.exports = {
  dbGetUsers,
  dbCreateUser,
  dbUserExists,
  dbFindUserByEmail,
  dbFindUserByUtorid,
}
