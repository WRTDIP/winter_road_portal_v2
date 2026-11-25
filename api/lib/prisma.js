import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "../prisma/client.js";
import { Pool } from 'pg'
const pool = new Pool(process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
} : {
    host: process.env.PGHOST || 'db',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
})
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export { prisma };

