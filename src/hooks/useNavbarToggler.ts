import { TStore } from '~/types';
import { useStore } from './useStore';

export const useNavBarToggler = (): [TStore['settings']['showMobileNavBar'], { toggle: () => void }] => {
    const [settings, setSettings] = useStore('settings');
    const isNavbarVisible = settings?.showMobileNavBar || false;

    const toggle = () => {
        if (!settings) return;

        setSettings({ ...settings, showMobileNavBar: !settings.showMobileNavBar });
    };

    return [isNavbarVisible, { toggle }];
};
