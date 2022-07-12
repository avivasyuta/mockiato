// @ts-ignore
import * as xhook from 'xhook'

// @ts-ignore
xhook.before((request, callback) => {
    if (request.url.startsWith('/item-add/load/v2')) {
        console.log('intercepted url', request.url)
        const finalResponse = {
            status: 500,
            text: JSON.stringify({
                status: 'bad-request',
                result: {
                    message: 'fuck you'
                }
            }),
            type: "json",
        };

        callback(finalResponse);
    } else {
        callback();
    }
});

export {};
