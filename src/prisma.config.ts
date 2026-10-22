import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // Supabase: migrations need the direct connection (port 5432), not the pgbouncer pool the app uses
        url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
        shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
    },
});