import fs from 'fs'
import path from 'path';

const packagePath = path.join("package.json");
if (!fs.existsSync(packagePath)) {
    console.error("package.json not found:", packagePath);
    process.exit(1);
}

const version = JSON.parse(fs.readFileSync(packagePath, "utf8")).version;

const manPath = path.join("src", "manifest.json");
const manVer = JSON.parse(fs.readFileSync(manPath, 'utf8'));
manVer.version = version;
fs.writeFileSync(manPath, JSON.stringify(manVer, null, 2));