import { createClient } from "@/prismicio";

export default async function Footer() {
    const client = createClient();

    const post = await client.getSingle("settings");
    
    return (
        <footer>Footer</footer>
    )
}