import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Client generation does not need a live database (for example inside the
    // Docker builder). Runtime environments always override this value.
    url: process.env.DATABASE_URL ?? "postgresql://atlas:atlas@localhost:5432/atlas",
  },
});
