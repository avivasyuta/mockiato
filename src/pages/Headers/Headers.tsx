import React, { memo, useMemo, useReducer } from 'react';
import { Button, Modal } from '@mantine/core';
import { IconPlaylistAdd } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { Content } from '../../components/Contnent';
import { useStore } from '../../hooks/useStore';
import { Spinner } from '../../components/Spinner';
import { overlaySettings } from '../../contstant';
import { AddProfileForm } from './components/AddProfileForm';
import { THeader, THeadersProfile } from '../../types';
import { NotFound } from '../../components/NotFound';
import { isEmpty } from '../../utils/isEmpty';
import { Profile } from './components/Profile';
import { addProfile, changeProfile } from './helpers';
import { THeaderFormAction, THeaderFormState } from './components/Profile/types';
import { TopPanel } from './components/TopPanel';

const initialFormState: THeaderFormState = {
    isOpen: false,
    header: undefined,
};

const headerFormReducer = (state: THeaderFormState, action: THeaderFormAction): THeaderFormState => {
    switch (action.type) {
        case 'open':
            return { isOpen: true, header: action.payload };
        case 'close':
            return { isOpen: false, header: undefined };
        default:
            return state;
    }
};

const HeadersPage: React.FC = () => {
    const [headerForm, dispatchHeaderForm] = useReducer(headerFormReducer, initialFormState);
    const [profiles, setProfiles] = useStore('headersProfiles');
    const [isProfileModelOpen, profileModelActions] = useDisclosure(false);

    const handleAddProfile = (profile: THeadersProfile) => {
        profileModelActions.close();
        setProfiles(addProfile(profiles, profile));
    };

    const handleChangeProfile = (profile: THeadersProfile): void => {
        setProfiles(changeProfile(profiles, profile));
    };

    const handleCloseForm = (): void => {
        dispatchHeaderForm({ type: 'close' });
    };

    const handleOpenForm = (header: THeader) => {
        dispatchHeaderForm({
            type: 'open',
            payload: header,
        });
    };

    const activeProfileId = useMemo(() => {
        const arr = Object.values(profiles ?? {});
        if (arr.length === 0) {
            return '';
        }
        const lastActiveProfile = arr.find((p) => p.lastActive);
        return lastActiveProfile ? lastActiveProfile.id : arr[0].id;
    }, [profiles]);

    const activeProfile = useMemo(() => (profiles ?? {})[activeProfileId] ?? null, [activeProfileId, profiles]);

    return (
        <>
            {profiles !== null && (
                <TopPanel
                    profiles={profiles}
                    activeProfile={activeProfile}
                    setProfiles={setProfiles}
                    onHeaderAdd={handleOpenForm}
                    onProfileAdd={profileModelActions.open}
                />
            )}

            <Content>
                {profiles === null && <Spinner />}

                {profiles !== null && isEmpty(profiles) && (
                    <NotFound
                        text="No profiles to show"
                        action={(
                            <Button
                                leftSection={<IconPlaylistAdd size={16} />}
                                variant="gradient"
                                size="compact-xs"
                                title="Add Profile"
                                gradient={{ from: 'indigo', to: 'cyan' }}
                                onClick={profileModelActions.open}
                            >
                                Add Profile
                            </Button>
                        )}
                    />
                )}

                {activeProfile && (
                    <Profile
                        headerForm={headerForm}
                        profile={activeProfile}
                        onChange={handleChangeProfile}
                        onHeaderEdit={handleOpenForm}
                        onCloseHeaderForm={handleCloseForm}
                    />
                )}

                <Modal
                    opened={isProfileModelOpen}
                    overlayProps={overlaySettings}
                    title="Add new profile"
                    onClose={profileModelActions.close}
                >
                    <AddProfileForm onSubmit={handleAddProfile} />
                </Modal>
            </Content>
        </>
    );
};

export const Headers = memo(HeadersPage);
