import { statusNodeId } from '~/contstant';

const createStyles = () => {
    const css = `
        @keyframes pulse {
            0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(253, 126, 20, 0.7);
            }
            70% {
                transform: scale(1);
                box-shadow: 0 0 0 10px rgba(253, 126, 20, 0);
            }
            100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(253, 126, 20, 0);
            }
        }
        .mockiato-status {
            display: inline-flex;
            position: fixed;
            right: 20px;
            bottom: 20px;
            width: 90px;
            height: 28px;
            font-size: 14px;
            justify-content: center;
            align-items: center;
            background: #FFE8CC;
            box-shadow: 0 0 0 0 rgba(253, 126, 20, 1);
            transform: scale(1);
            animation: pulse 2s infinite;
            color: #fd7e14;
            border: 1px solid #fd7e14;
            border-radius: 5px;
            z-index: 9999999999;
        }
    `;
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');

    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
};

export const createStatus = (isEnabled: boolean): void => {
    createStyles();

    const statusNode = document.createElement('div');

    statusNode.className = 'mockiato-status';
    statusNode.id = statusNodeId;
    statusNode.innerText = 'Mockiato';
    statusNode.title = 'Mockiato extension enabled for this host';
    statusNode.style.opacity = isEnabled ? '1' : '0';

    const bodyNode = document.getElementsByTagName('body')[0];
    bodyNode.appendChild(statusNode);
};
