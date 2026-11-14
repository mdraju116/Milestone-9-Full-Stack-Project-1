import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("MONGODB_URI is not set");

export const mongoClient = new MongoClient(mongoUri);
export const db = mongoClient.db("hireloop-db1");
