import { cp, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, ".next", "standalone");

loadEnvConfig(projectRoot, false);

// Next's standalone output intentionally omits public and static assets because
// deployments commonly serve them from a CDN. Keep `pnpm start` self-contained
// for local production checks; the Docker image performs the same copies.
await mkdir(path.join(standaloneRoot, ".next"), { recursive: true });
await cp(path.join(projectRoot, "public"), path.join(standaloneRoot, "public"), {
  recursive: true,
  force: true,
});
await cp(
  path.join(projectRoot, ".next", "static"),
  path.join(standaloneRoot, ".next", "static"),
  { recursive: true, force: true },
);

await import(pathToFileURL(path.join(standaloneRoot, "server.js")).href);
