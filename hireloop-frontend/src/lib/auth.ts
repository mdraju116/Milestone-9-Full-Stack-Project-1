import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db, mongoClient } from "@/lib/mongodb";

export { db } from "@/lib/mongodb";

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,

	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
	},
	user: {
		additionalFields: {
			role: {
				type: ["jobSeeker", "employer"],
				required: true,
				input: true,
			},
		},
	},
	database: mongodbAdapter(db, {
		client: mongoClient
	}),
});
