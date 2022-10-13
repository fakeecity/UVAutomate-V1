'use strict';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    if (tab.url.startsWith('https://shibidp.its.virginia.edu/idp/')) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id, allFrames: true },
          files: ['injector.js'],
        }
      );
    }
  }
});
