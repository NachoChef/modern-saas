import { clearSupabaseData, createContact, createUser, startSupabase } from "./utils";

async function seed() {
    try {
        await startSupabase()
        await clearSupabaseData()
        const user = await createUser({ email: "t@t.com", full_name: "Test User", password: "password" })

        for (let i = 0; i < 5; i++) {
            await createContact(user.id)
        }
    } catch (e) {
        console.error(e)
        process.exit(1)
    }

    process.exit()
}
seed();