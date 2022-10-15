'use strict';

import { BrowserQRCodeReader } from '@zxing/browser';
import { createDigest} from '@otplib/plugin-crypto-js';
import {
  hotpOptions,
  hotpToken,
} from '@otplib/core';

document.addEventListener('DOMContentLoaded', run());

function run() {
  if (window.location !== window.parent.location) {
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

// duoLogin
async function duoLogin() {
  if (document.querySelector('select[name="device"]')) {
    const correct = await getLoginDevice();
    if (correct != -1) {
      document.querySelector('select[name="device"]').value = correct;
      const code = await generateCode();
      submitCode(code);
    } else {
      duoOnboard();
    }
  }
}

async function getLoginDevice() {
  const uid = await getUid();
  for (let option in document.querySelector('select[name="device"]').options) {
    if (document.querySelector('select[name="device"]').options[option].innerText) {
      if (document.querySelector('select[name="device"]').options[option].innerText.trim() === `UVAuto ${uid} (iOS)`) {
        return document.querySelector('select[name="device"]').options[option].value;
      }
    }
  }
  return -1;
}

async function generateCode() {
  const otp = (await chrome.storage.local.get()).hotpData;
  const code = hotpToken(otp.secret, otp.count, hotpOptions({ createDigest }));
  otp.count += 1;
  await chrome.storage.local.set({ hotpData: otp });
  return code;
}

function submitCode(code) {
  document.getElementById('passcode').click();
  fillField(document.querySelector('input[name="passcode"]'), code);
  document.querySelector('input[name="dampen_choice"]').click();
  document.getElementById('passcode').click();
}

function duoOnboard() {
  document.getElementById('new-device').click();
}

// newDevice
function newDevice() {
  alert('Setup: you must manually enter 2fa for this step.');
}

// typeOfDevice
function typeOfDevice() {
  document.querySelector('input[value="tablet"]').click();
  document.querySelector('button[type="submit"]').click();
}

// mobilePlatforms
function mobilePlatforms() {
  document.querySelector('input[value="iOS"]').click();
  document.getElementById('continue').click();
}

// installDuo
function installDuo() {
  document.getElementById('duo-installed').click();
}

// activateDuo
async function activateDuo() {
  if (document.querySelector('img[class="qr"]')) {
    const codeReader = new BrowserQRCodeReader();
    const resultImage = String(await codeReader.decodeFromImageElement(document.querySelector('img[class="qr"]')));
    let duoResponse;
    try {
      const uri = resultImage.split('-', 2);
      const code = uri[0];
      const buff1 = window.Buffer.from(uri[1], 'base64');
      const host = buff1.toString('ascii');
      const url = `https://${host}/push/v2/activation/${code}?customer_protocol=1`;
      const headers = { 'User-Agent': 'okhttp/2.7.5' };
      const data = {
        jailbroken: 'false',
        architecture: 'arm64',
        region: 'US',
        app_id: 'com.duosecurity.duomobile',
        full_disk_encryption: 'true',
        passcode_status: 'true',
        platform: 'Android',
        app_version: '3.49.0',
        app_build_number: '323001',
        version: '11',
        manufacturer: 'unknown',
        language: 'en',
        model: 'Pixel 3a',
        security_patch_level: '2021-02-01',
      };
      const re = await (await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      })).json();
      duoResponse = re.response;
    } catch (err) {
      throw err;
    }
    const finalSecret = duoResponse.hotp_secret;
    await chrome.storage.local.set({ hotpData: { secret: finalSecret, count: 0 } });
    await waitForElement('i[class="ss-check"]');
    document.getElementById('continue').click();
  }
}

// mySettings
async function mySettings() {
  const uid = await getUid();
  document.querySelector('.new-device').querySelector('input[name="pname"]').value = `UVAuto ${uid}`;
  document.querySelector('.new-device').querySelector('.edit-submit').click();
  await waitForElement('.message-text');
  document.getElementById('continue-to-login').click();
}

// topFrame
function topFrame() {
  if (document.querySelector('.hidden-sm-down')) {
    switch (document.querySelector('.hidden-sm-down').innerText) {
      case 'Your first authentication step when logging in to UVA systems':
        if (document.querySelector('.error') && document.querySelector('.error').innerText === 'Incorrect computing ID or password') {
          break;
        }
        netBadgeLogin();
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
  const auth = (await chrome.storage.local.get()).input;
  fillField(document.querySelector('input[name="j_username"]'), auth.k_username);
  fillField(document.querySelector('input[name="j_password"]'), auth.k_password);
  document.querySelector('input[name="_eventId_proceed"]').click();
}

// helpers
function expired() {
  history.back();
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

async function getUid() {
  const id = (await chrome.storage.local.get()).uid;
  if (id == undefined) {
    let uid = Math.random().toString(36).slice(2);
    if (uid.length > 6) {
      uid = uid.substring(0, 6);
    }
    await chrome.storage.local.set({ uid: uid });
    return uid;
  }
  return id;
}
