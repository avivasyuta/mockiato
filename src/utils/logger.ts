export const logWarn = (text: string) => {
    // eslint-disable-next-line no-console
    console.warn(text);
};

export const logError = (err: unknown) => {
    // eslint-disable-next-line no-console,max-len
    console.error('An error has occurred in the Mockiato extension. Please report it in issues on github https://github.com/avivasyuta/mockiato/issues');
    // eslint-disable-next-line no-console
    console.error(err);
};
