import { EXTENSION_NAME } from '../contstant';

chrome.devtools.panels.create(EXTENSION_NAME, 'icons/mockiato-24.png', 'index.html');

export {};
