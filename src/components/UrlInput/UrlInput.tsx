import React, { ChangeEventHandler, FC } from 'react';
import { Checkbox, TextInput, Tooltip } from '@mantine/core';
import { IconRegex } from '@tabler/icons-react';
import { type UrlType } from '~/types';

export type UrlInputProps = {
    valueType: UrlType;
    value?: string;
    onChange?: ChangeEventHandler;
    onChangeValueType: (value: UrlType) => void;
};

export const UrlInput: FC<UrlInputProps> = ({ value, valueType, onChange, onChangeValueType }) => {
    const handleChangeValueType = () => {
        onChangeValueType(valueType === 'url' ? 'regexp' : 'url');
    };

    return (
        <>
            <TextInput
                label="URL"
                size="xs"
                value={value}
                leftSection={
                    valueType === 'regexp' ? (
                        <Tooltip
                            label="RegExp enabled"
                            position="bottom"
                            transitionProps={{ transition: 'scale' }}
                            openDelay={150}
                            withArrow
                        >
                            <IconRegex
                                size={18}
                                color="#9775fa"
                            />
                        </Tooltip>
                    ) : undefined
                }
                required
                onChange={onChange}
            />

            <Checkbox
                checked={valueType === 'regexp'}
                label="Use as regular expression"
                size="xs"
                mt="xs"
                onChange={handleChangeValueType}
            />
        </>
    );
};
