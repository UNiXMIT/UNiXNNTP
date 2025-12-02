import fs from 'fs'
import path from 'path';

const manifestPath = path.join("src", "manifest.json");
if (!fs.existsSync(manifestPath)) {
    console.error("manifest.json not found:", manifestPath);
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const version = manifest.version;

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

const npmVerPath = path.join("package.json");
const npmVer = JSON.parse(fs.readFileSync(npmVerPath, 'utf8'));
npmVer.version = version;
fs.writeFileSync(npmVerPath, JSON.stringify(npmVer, null, 2));

const updatesDir = path.join("updates", version);
const xpiName = `0158949de7f44eb48392-${version}.xpi`;
if (fs.existsSync(xpiName)) {
    fs.renameSync(xpiName, path.join(updatesDir, xpiName));
} else {
    console.error("Signed xpi not found:", xpiName);
    process.exit(1);
}

console.log(`\nSigning complete. Version ${version} is ready for release.\n`);