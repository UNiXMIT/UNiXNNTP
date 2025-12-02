import fs from 'fs'
import path from 'path';

const manifestPath = path.join("src", "manifest.json");
if (!fs.existsSync(manifestPath)) {
    console.error("manifest.json not found:", manifestPath);
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const version = manifest.version;

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const updatesDir = path.join("updates", version);
ensureDir(updatesDir);