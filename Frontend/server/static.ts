import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(
    import.meta.dirname,
    "..",
    "dist",
    "public"
  );

  if (!fs.existsSync(distPath)) {
    console.error("Static path missing:", distPath);
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
