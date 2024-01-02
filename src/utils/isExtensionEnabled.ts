import { TStoreSettings } from '~/types';

export const isExtensionEnabled = (settings: TStoreSettings): boolean => {
    const pageHost = window.location.host;
    const excludedHosts = settings.excludedHosts.map((host) => host.value);

    return !(excludedHosts.includes(pageHost) || !settings.enabledHosts[pageHost]);
};
