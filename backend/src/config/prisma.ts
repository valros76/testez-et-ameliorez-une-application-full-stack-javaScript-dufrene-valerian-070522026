import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

// On exporte une instance UNIQUE de Prisma configurée avec l'adaptateur pour éviter les bugs liées à la montée de version
export const prisma = new PrismaClient({
  adapter
});