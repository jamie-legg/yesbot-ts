import "reflect-metadata";
import { PrismaClient } from "@yes-theory-fam/database/client";
import { createYesBotLogger } from "./log";

const logger = createYesBotLogger("db", "init");
logger.debug("Creating PrismaClient instance");
const prisma = new PrismaClient();

export default prisma;