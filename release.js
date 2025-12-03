import fs from 'fs'
import path from 'path';
import { Octokit } from "@octokit/rest";
import * as dotenv from 'dotenv'
dotenv.config({ quiet: true })

const packagePath = path.join("package.json");
if (!fs.existsSync(packagePath)) {
    console.error("package.json not found:", packagePath);
    process.exit(1);
}

const version = JSON.parse(fs.readFileSync(packagePath, "utf8")).version;

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function createRelease() {
    const release = await octokit.repos.createRelease({
        owner: "UNiXMIT",
        repo: "UNiXNNTP",
        tag_name: version,
        name: version,
        draft: false,
        prerelease: false,
        target_commitish: "main"
    });
    const releaseId = release.data.id;
    const releaseFiles = [
        `updates/${version}/0158949de7f44eb48392-${version}.xpi`
    ];
    for (const file of releaseFiles) {
        const fileData = fs.readFileSync(file);
        const fileName = path.basename(file);
        await octokit.repos.uploadReleaseAsset({
            owner: "UNiXMIT",
            repo: "UNiXNNTP",
            release_id: releaseId,
            name: fileName,
            data: fileData,
            headers: {
                "content-type": "application/octet-stream",
                "content-length": fileData.length,
            },
        });
    }
}

createRelease().catch(err => {
    console.error(err);
    process.exit(1);
});

console.log(`\nRelease complete. Version ${version} has been released.\n`);