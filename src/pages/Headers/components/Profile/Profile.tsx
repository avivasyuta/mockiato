import React, { FC } from 'react';
import { Drawer } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { THeader } from '../../../../types';
import { overlaySettings } from '../../../../contstant';
import { HeaderForm } from '../../../../components/HeaderForm';
import { HeadersTable } from './components/HeadersTable';
import { ProfileProps } from './types';

export const Profile: FC<ProfileProps> = (props) => {
    const { profile, headerForm, onChange, onCloseHeaderForm, onHeaderEdit } = props;

    const requestHeaders = profile.headers.filter((h) => h.type === 'request');

    const handleDeleteHeader = (id: string): void => {
        const newProfile = { ...profile };
        newProfile.headers = newProfile.headers.filter((h) => h.id !== id);
        onChange(newProfile);
    };

    const handleChangeHeader = (id: string, value: THeader) => {
        const newProfile = { ...profile };
        newProfile.headers = newProfile.headers.map((h) => {
            if (h.id === id) {
                return value;
            }
            return h;
        });
        onChange(newProfile);
    };

    const handleSubmitForm = (header: THeader): void => {
        const isNew = !profile.headers.find((h) => h.id === header.id);

        const newProfile = { ...profile };

        if (isNew) {
            newProfile.headers.push(header);
        } else {
            const index = newProfile.headers.findIndex((h) => h.id === header.id);
            newProfile.headers[index] = header;
        }

        onChange(newProfile);
        onCloseHeaderForm();

        showNotification({
            message: 'Header modification data was saved',
            color: 'green',
        });
    };

    return (
        <>
            <HeadersTable
                headers={requestHeaders}
                onEdit={onHeaderEdit}
                onDelete={handleDeleteHeader}
                onChange={handleChangeHeader}
            />

            <Drawer
                opened={headerForm.isOpen}
                padding="sm"
                position="right"
                size="40%"
                title="Add new header"
                overlayProps={overlaySettings}
                styles={{
                    content: { display: 'flex', flexDirection: 'column' },
                    body: { display: 'flex', flex: 1 },
                }}
                offset={8}
                radius="md"
                onClose={onCloseHeaderForm}
            >
                {headerForm.isOpen && headerForm.header && (
                    <HeaderForm
                        initialValue={headerForm.header}
                        onClose={onCloseHeaderForm}
                        onSubmit={handleSubmitForm}
                    />
                )}
            </Drawer>
        </>
    );
};
