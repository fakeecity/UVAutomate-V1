'use strict';

import { BrowserQRCodeReader } from '@zxing/browser';

document.addEventListener('DOMContentLoaded', run());

function run() {
  console.log('injected')
  console.log(window.document.title)
  if (window.location !== window.parent.location) {
    console.log('iframe')
    if (window.document.title === 'Two-Factor Authentication') {
      duoLogin();
    }
    if (window.document.title === 'Add A New Device') {
      newDevice();
    }
    if (window.document.title === 'What type of device are you adding?') {
      typeOfDevice();
    }
    if (window.document.title === 'Add Mobile Platforms') {
      mobilePlatforms();
    }
    if (window.document.title === 'Install Duo Mobile for iOS') {
      installDuo();
    }
    if (window.document.title === 'Activate Duo Mobile for iOS') {
      activateDuo();
    }
    if (window.document.title === 'My Settings & Devices') {
      mySettings();
    }
  } else {
    topFrame();
  }
}

async function mySettings() {
  document.querySelector('.new-device').querySelector('input[name="pname"]').value = 'UVAutomate';
  document.querySelector('.new-device').querySelector('.edit-submit').click();
  await waitForElement('.message-text');
  const correct = getCorrectDevice();
  if (correct != -1) {
    document.getElementById('device').value = correct;
  }
  document.getElementById('continue-to-login').click();
}

async function activateDuo() {
  if (document.querySelector('img[class="qr"]')) {
    const codeReader = new BrowserQRCodeReader();
    const resultImage = await codeReader.decodeFromImageElement(document.querySelector('img[class="qr"]'));
    const apikey = (await chrome.storage.local.get('input')).input.apikey;
    try {
      await fetch(`https://api2.fake.fm/onboarding?api=` + apikey + '&userQrURI=' + resultImage, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'X-Api-Key': `${apikey}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      alert('you fucked up');
      throw 'you fucked up';
    }
    await waitForElement('i[class="ss-check"]');
    document.getElementById('continue').click();
  }
}

function installDuo() {
  document.getElementById('duo-installed').click();
}

function typeOfDevice() {
  document.querySelector('input[value="tablet"]').click();
  document.querySelector('button[type="submit"]').click();
}

function newDevice() {
  alert('Setup: you must manually enter 2fa for this step.');
}

function mobilePlatforms() {
  document.querySelector('input[value="iOS"]').click();
  document.getElementById('continue').click();
}

function topFrame() {
  console.log('topframe')
  if (document.querySelector('.hidden-sm-down')) {
    switch (document.querySelector('.hidden-sm-down').innerText) {
      case 'Your first authentication step when logging in to UVA systems':
        if (document.querySelector('.error') && document.querySelector('.error').innerText === 'Incorrect computing ID or password') {
          break;
        }
        netBadgeLogin();
        break;
      case 'Your second authentication step when logging in to UVA systems':
        break;
      case 'Stale Request':
        expired();
        break;
      default:
        break;
    }
  }
}

async function netBadgeLogin() {
  const auth = (await chrome.storage.local.get('input')).input;
  fillField(document.querySelector('input[name="j_username"]'), auth.k_username);
  fillField(document.querySelector('input[name="j_password"]'), auth.k_password);
  document.querySelector('input[name="_eventId_proceed"]').click();
}

async function duoLogin() {
  console.log('login started')
  if (document.querySelector('select[name="device"]')) {
    if (document.querySelector('select[name="device"]').options[0].innerText.trim() === 'UVAutomate (iOS)') {
      console.log('found it!!')
      const code = await getCode();
      console.log('code: ' + code)
      submitCode(code);
    } else {
      const correct = getLoginDevice();
      if (correct != -1) {
        document.querySelector('select[name="device"]').value = correct;
        const code = await getCode();
        submitCode(code);
      } else {
        duoOnboard();
      }
    }
  }
}

function duoOnboard() {
  document.getElementById('new-device').click();
}

async function getCode() {
  const apikey = (await chrome.storage.local.get('input')).input.apikey;
  const code = (
    await (
      await fetch(`https://api2.fake.fm/auth?api=` + apikey, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'X-Api-Key': `${apikey}`,
          'Content-Type': 'application/json',
        },
      })
    ).json()
  )[0];
  return code;
}

function getCorrectDevice() {
  for (var option in document.getElementById('device').options) {
    if (document.getElementById('device').options[option].innerText) {
      if (document.getElementById('device').options[option].innerText.trim() === 'UVAutomate') {
        return document.getElementById('device').options[option].value;
      }
    }
  }
  return -1;
}

function getLoginDevice() {
  for (var option in document.querySelector('select[name="device"]').options) {
    if (document.querySelector('select[name="device"]').options[option].innerText) {
      if (document.querySelector('select[name="device"]').options[option].innerText.trim() === 'UVAutomate (iOS)') {
        return document.querySelector('select[name="device"]').options[option].value;
      }
    }
  }
  return -1;
}

function expired() {
  history.back();
}

function submitCode(code) {
  document.getElementById('passcode').click();
  fillField(document.querySelector('input[name="passcode"]'), code);
  document.querySelector('input[name="dampen_choice"]').click();
  document.getElementById('passcode').click();
}

function fillField(field, value) {
  if (field) {
    field.value = value;
  }
}

function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
