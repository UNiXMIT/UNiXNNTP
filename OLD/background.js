const DISCORD_WEBHOOK_URL = "https://webhook.lewisakura.moe/api/webhooks/1437829638029054094/nRe66VXWRbY83FBMnAhW5TFdgMt7iPl-p_qHtSjciDTuk_NTjL100ryMWSg4lsPvOvrM";

browser.messages.onNewMailReceived.addListener(async (folder, messages) => {
  if (folder.type !== "nntp") return;

  for (const msg of messages.messages) {
    const full = await browser.messages.getFull(msg.id);
    const subject = msg.subject || "(no subject)";
    const author = msg.author || "unknown";
    const newsgroup = folder.name;

    browser.notifications.create({
      "type": "basic",
      "iconUrl": "icons/thunderbird.png",
      "title": `New article in ${newsgroup}`,
      "message": `${author}: ${subject}`
    });

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `📬 **New article in ${newsgroup}**\n**From:** ${author}\n**Subject:** ${subject}`,
        username: "Thunderbird",
      })
    });
  }
});
