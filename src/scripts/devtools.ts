import { EXTENSION_NAME } from '../contstant';

chrome.devtools.panels.create(EXTENSION_NAME, 'mockiato-16.png', 'index.html');

export {};
