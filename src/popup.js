'use strict';

chrome.storage.local.get(function (result) {
  if (!result.uid) {
    let uid = Math.random().toString(36).slice(2);
    if (uid.length > 6) {
      uid = uid.substring(0, 6);
    }
    chrome.storage.local.set({ uid: uid }, function () {
      console.log('New ID Generated! ' + uid);
    });
  }
  if (!result.input) {
    document.getElementById('k_username').value = '';
    document.getElementById('k_password').value = '';
  } else {
    document.getElementById('k_username').value = result.input.k_username;
    document.getElementById('k_password').value = result.input.k_password;
  }
  document.getElementById('saveKey').addEventListener('click', function () {
    const user = document.getElementById('k_username').value;
    const pass = document.getElementById('k_password').value;
    submit(user, pass);
  });
});

function submit(user, pass) {
  chrome.storage.local.set({ input: { k_username: user, k_password: pass } }, function () {
    console.log('Data Updated! ' + user + ':' + pass);
  });
}
