# [UNiXNNTP](https://github.com/UNiXMIT/UNiXNNTP)
# Newsgroup Notifications

This is a Thunderbird extension that enables a dual-channel notification system:  

1. Native Windows Notifications: Provides immediate, local desktop alerts.
2. Discord Webhook Integration: Optionally sends remote notifications to a specified Discord channel if a Discord Webhook URL has been configured.

Prerequisite: Thunderbird version 115.0+.  

## Prerequisites

### Mandatory

Thunderbird native mail notifications have to be turned off, as they do not work for incoming newsgroup articles.   

1. Open Thunderbird Settings
2. Under General, scroll down to the "Incoming Mail" section
3. If on Windows, enable "Use the system notification"
4. Disable the following:
    - Show and Alert
    - Play a Sound

### Recommended

The extension works well if you enable Thunderbird to minimise to tray.     

1. Open Thunderbird Settings
2. Under General, scroll down to the "System Integration" section
3. Enable:
    - When Thunderbird is minimized, move it to the tray

## Install

1. Download the latest *.xpi file.
2. In Thunderbird, navigate to Settings > Add-ons and Themes > Extensions.  
3. Click the Cog icon and select 'Install Add-on From File...'
4. Select the *.xpi file from the Windows explorer window and click Open.  
5. In the Pop-up that appears in Thunderbird, click 'Add'.

## Update

[How to update add-ons.](https://support.mozilla.org/en-US/kb/how-update-add-ons)

## Configuration

The extension can be configured via the extension options page.  

### What can be configured?

- The Discord Webhook URL.  