const installedVersion = browser.runtime.getManifest().version;
const configURL = browser.runtime.getURL('config.html');

function save_options() {

  let webhook = document.getElementById('webhook').value;

  browser.storage.local.set({
      savedWebhook: webhook,
  }, function() {
      let status = document.getElementById('status');
      status.textContent = 'Options Saved';
      setTimeout(function() {
          status.textContent = '';
      }, 750);
  });
}

function restore_options() {
  browser.storage.local.get({
      savedWebhook: '',
  }, function(result) {
      document.getElementById('webhook').value = result.savedWebhook;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('version').textContent = installedVersion;