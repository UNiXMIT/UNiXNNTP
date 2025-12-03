import fs from 'fs'
import path from 'path';

const packagePath = path.join("package.json");
if (!fs.existsSync(packagePath)) {
    console.error("package.json not found:", packagePath);
    process.exit(1);
}

const version = JSON.parse(fs.readFileSync(packagePath, "utf8")).version;

const updatesDir = path.join("updates", version);
if (!fs.existsSync(updatesDir)) fs.mkdirSync(updatesDir, { recursive: true });

const verPath = path.join("updates", "updates.json");
const ver = JSON.parse(fs.readFileSync(verPath, 'utf8'));
const ID = "{8c1e3a77-45b9-4a27-9f4e-8f0f5cb83d7d}";
const updateURL = `https://raw.githubusercontent.com/UNiXMIT/UNiXNNTP/main/updates/${version}/0158949de7f44eb48392-${version}.xpi`;
const newEntry = {
    version: version,
    update_link: updateURL
};
ver.addons[ID].updates.push(newEntry);
fs.writeFileSync(verPath, JSON.stringify(ver, null, 2));

const xpiName = `0158949de7f44eb48392-${version}.xpi`;
if (fs.existsSync(xpiName)) {
    fs.renameSync(xpiName, path.join(updatesDir, xpiName));
} else {
    console.error("Signed xpi not found:", xpiName);
    process.exit(1);
}

console.log(`\nSigning complete. Version ${version} is ready for release.\n`);