import { nanoid } from 'nanoid';
import { EXTENSION_NAME } from '../contstant';

const closeTimeout = 10000;
const stackId = 'mockiato-alert-stack';

const closeSVG =
    // eslint-disable-next-line max-len
    '<svg role="button" tabindex="0" aria-hidden="false" data-icon="close" viewBox="0 0 24 24" class="mockiato-alert-close"><path d="M18.7 5.3a1 1 0 0 0-1.4 0L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3a1 1 0 0 0 1.4-1.42L13.42 12l5.3-5.3a1 1 0 0 0 0-1.4Z"></path></svg>';

const createStyles = () => {
    const css = `
        @keyframes mockiatoDFadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        .mockiato-alert-stack {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 99999;
            color: #000000;
        }
        .mockiato-alert {
            font-family: Arial, serif
            font-size: 14px;
            display: flex;
            width: 400px;
            background: #fff4e6;
            padding: 8px 16px;
            padding-right: 8px;
            border-radius: 5px;
            gap: 8px;
            white-space: break-spaces;
            animation: fadeIn .5s;
            box-sizing: border-box;
        }
        .mockiato-alert-text {
            flex: 1;
            overflow: hidden;
        }
        .mockiato-alert-close {
            fill: currentcolor;
            align-self: center;
            vertical-align: middle;
            flex-shrink: 0;
            height: 16px;
            user-select: none;
            cursor: pointer;
            transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0s;
            border-radius: 100px;
            display: inline-block;
            box-sizing: content-box;
            padding: 8px;
        }
        .mockiato-alert-close:hover {
            background-color: rgba(0, 0, 0, 0.08);
        }
        .mockiato-alert-url {
            color: #fd7e14;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .mockiato-alert-spoiler {
            margin-top: 8px;
            color: #909296;
            font-size: 12px;
        }
    `;
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');

    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
};

export const createStack = (): void => {
    createStyles();

    const stack = document.createElement('div');

    stack.id = stackId;
    stack.className = 'mockiato-alert-stack';

    const bodyNode = document.getElementsByTagName('body')[0];
    bodyNode.appendChild(stack);
};

export const removeStack = (): void => {
    const stack = document.getElementById(stackId);
    stack?.remove();
};

const handleClose = (id: string) => {
    const alert = document.getElementById(id);
    alert?.remove();
};

// eslint-disable-next-line no-undef
const createAlertNode = (url: string | URL): HTMLElementTagNameMap['div'] => {
    const id = nanoid();

    const alert = document.createElement('div');
    const close = document.createElement('div');

    // eslint-disable-next-line max-len
    alert.innerHTML = `<div class="mockiato-alert-text"><span>Mockiato intercepted request</span><div class="mockiato-alert-url" title="${url}">${url}</div><div class="mockiato-alert-spoiler">See logs in the «Mockiato» tab in Dev Tools.</div></div>`;
    alert.className = 'mockiato-alert';
    alert.id = id;

    close.innerHTML = closeSVG;
    close.onclick = () => handleClose(id);

    alert.appendChild(close);

    return alert;
};

const logToConsole = (url: string | URL): void => {
    const text = `${EXTENSION_NAME} intercepted request ${url}. See logs in the «Mockiato» tab in Dev Tools.`;
    // eslint-disable-next-line no-console
    console.warn(text);
};

export const showAlert = (url: string) => {
    logToConsole(url);
    const alert = createAlertNode(url);

    const stackNode = document.getElementById(stackId);
    if (!stackNode) {
        // eslint-disable-next-line no-console
        console.warn("Mockiato stack node wasn't found.");
        return;
    }

    stackNode.appendChild(alert);

    setTimeout(() => {
        handleClose(alert.id);
    }, closeTimeout);
};
