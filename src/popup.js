'use strict';

chrome.storage.local.get(function (result) {
  if (!result.input) {
    document.getElementById('apivalue').value = '';
    document.getElementById('k_username').value = '';
    document.getElementById('k_password').value = '';
  } else {
    document.getElementById('apivalue').value = result.input.apikey;
    document.getElementById('k_username').value = result.input.k_username;
    document.getElementById('k_password').value = result.input.k_password;
  }
  document.getElementById('saveKey').addEventListener('click', function () {
    const key = document.getElementById('apivalue').value;
    const user = document.getElementById('k_username').value;
    const pass = document.getElementById('k_password').value;
    submit(key, user, pass);
  });
});
function submit(key, user, pass) {
  chrome.storage.local.set({ input: { apikey: key, k_username: user, k_password: pass } }, function () {
    console.log('Data Updated! ' + key + ':' + user + ':' + pass);
  });
}
