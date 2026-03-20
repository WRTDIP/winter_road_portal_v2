import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "../prisma/client.js";
import { Pool } from 'pg'
import dns from "dns/promises";
// const connectionString = `${process.env.DATABASE_URL}`;
const maxAttempts = 3;
let ip;
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
        const [resolved] = await dns.resolve4("db");
        ip = resolved;
        console.log("db IP:", ip);
        break;
    } catch (err) {
        console.error(`Attempt ${attempt} failed to resolve db:`, err);
        if (attempt === maxAttempts) {
            console.error(`Giving up after ${maxAttempts} attempts`);
        } else {
            await new Promise((r) => setTimeout(r, 500));
        }
    }
}
const connectionString = `postgresql://postgres:password@${ip}:5432/wramp?schema=public`;
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export { prisma };

