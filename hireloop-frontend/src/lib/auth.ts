import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("hireloop-db1");

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,

	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
	},
	database: mongodbAdapter(db, {
		client
	}),
});
