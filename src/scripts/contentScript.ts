// Inject Script to user's DOM
const s = document.createElement("script");
// @ts-ignore
s.src = chrome.runtime.getURL("injectInterceptor.js");
(document.head || document.documentElement).appendChild(s);

export {};
