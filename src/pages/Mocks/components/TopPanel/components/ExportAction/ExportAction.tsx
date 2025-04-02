import React, { FC } from 'react';
import { IconDownload } from '@tabler/icons-react';
import { iconSize } from '~/contstant';
import { Menu } from '@mantine/core';
import { TMock, TMockGroup } from '~/types';

type ExportActionProps = {
    mocks: TMock[];
    groups: TMockGroup[];
};

export const ExportAction: FC<ExportActionProps> = ({ mocks, groups }) => {
    const handleDownload = () => {
        const data = { mocks, groups };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'mockiato-mocks.json';
        a.click();

        URL.revokeObjectURL(url);
    };

    return (
        <Menu.Item
            leftSection={<IconDownload size={iconSize} />}
            onClick={handleDownload}
        >
            Export mocks
        </Menu.Item>
    );
};
