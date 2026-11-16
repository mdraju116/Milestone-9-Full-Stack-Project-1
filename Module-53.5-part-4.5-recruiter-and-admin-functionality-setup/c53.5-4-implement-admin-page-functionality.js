/* 

https://better-auth.com/docs/plugins/admin


✅✅Add the plugin to your auth config
To use the Admin plugin, add it to your auth config.

auth.ts

import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"
export const auth = betterAuth({
    // ... other config options
    plugins: [
        admin() 
    ]
})


✅✅Migrate the database
Run the migration or generate the schema to add the necessary fields and tables to the database.

npx auth migrate

See the Schema section to add the fields manually.


✅✅Add the client plugin
Next, include the admin client plugin in your authentication client instance.

auth-client.ts

import { createAuthClient } from "better-auth/client"
import { adminClient } from "better-auth/client/plugins"
export const authClient = createAuthClient({
    plugins: [
        adminClient()  
    ]
})


✅✅Usage
Before performing any admin operations, the user must be authenticated with an admin account. An admin is any user assigned the admin role or any user whose ID is included in the adminUserIds option.
To create the first admin user, run the CLI after adding the Admin plugin and applying the schema:


npx auth@latest create-admin --email admin@example.com --name "Admin" --role admin


*/