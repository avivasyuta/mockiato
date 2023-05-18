import React, { FC, useReducer } from 'react';
import { Drawer, Space } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { THeader } from '../../../../types';
import { overlaySettings } from '../../../../contstant';
import { HeaderForm } from '../../../../components/HeaderForm';
import { HeadersTable } from './components/HeadersTable';
import { ProfileProps, THeaderFormAction, THeaderFormState } from './types';
import { Panel } from './components/Panel';

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

export const Profile: FC<ProfileProps> = ({ profile, onChange }) => {
    const [headerForm, dispatchHeaderForm] = useReducer(headerFormReducer, initialFormState);

    const requestHeaders = profile.headers.filter((h) => h.type === 'request');
    const responseHeaders = profile.headers.filter((h) => h.type === 'response');

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

    const handleEditHeader = (header: THeader): void => {
        dispatchHeaderForm({
            type: 'open',
            payload: header,
        });
    };

    const handleOpenForm = (initialValue: THeader) => {
        dispatchHeaderForm({ type: 'open', payload: initialValue });
    };

    const handleCloseForm = (): void => {
        dispatchHeaderForm({ type: 'close' });
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
        handleCloseForm();

        showNotification({
            message: 'Header modification data was saved',
            color: 'green',
        });
    };

    return (
        <>
            <Panel
                type="request"
                onAdd={handleOpenForm}
            />

            <HeadersTable
                headers={requestHeaders}
                onEdit={handleEditHeader}
                onDelete={handleDeleteHeader}
                onChange={handleChangeHeader}
            />

            <Space h="xl" />

            <Panel
                type="response"
                onAdd={handleOpenForm}
            />

            <HeadersTable
                headers={responseHeaders}
                onDelete={handleDeleteHeader}
                onEdit={handleEditHeader}
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
                onClose={handleCloseForm}
            >
                {headerForm.isOpen && headerForm.header && (
                    <HeaderForm
                        initialValue={headerForm.header}
                        onClose={handleCloseForm}
                        onSubmit={handleSubmitForm}
                    />
                )}
            </Drawer>
        </>
    );
};
