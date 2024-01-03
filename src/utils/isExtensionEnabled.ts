import { TStoreSettings } from '~/types';

export const isExtensionEnabled = (settings: TStoreSettings): boolean => {
    const pageHost = window.location.host;
    return settings.enabledHosts[pageHost] ?? false;
};
