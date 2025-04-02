import React, { FC, useState } from 'react';
import { Button, Code, FileButton, Group, Stack, Text } from '@mantine/core';
import { TMock, TMockGroup } from '~/types';
import { ParsedData, parseMocks } from './parser';
import styles from './ImportMocksForm.module.css';

export type ImportMocksProps = {
    onSuccess: (mocks: TMock[], groups: TMockGroup[]) => void;
};

export const ImportMocksForm: FC<ImportMocksProps> = ({ onSuccess }) => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [errors, setErrors] = useState<string[] | null>(null);

    const handleFile = (file: File | null) => {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const text = reader.result as string;
            const result = parseMocks(text);

            if (result.errors) {
                setErrors(result.errors);
            } else {
                setErrors(null);
            }

            if (result.parsed) {
                setParsedData(result.parsed);
            } else {
                setParsedData(null);
            }

            setFileContent(text);
        };

        reader.onerror = () => {
            setErrors(['Error reading file']);
            setFileContent(null);
        };

        reader.readAsText(file);
    };

    const handleSubmit = () => {
        if (parsedData) {
            onSuccess(parsedData.mocks, parsedData.groups);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={styles.form}
        >
            <Stack
                justify="center"
                align="center"
                className={styles.fileUploader}
                gap="xs"
            >
                <Text
                    size="sm"
                    c="gray"
                >
                    Select file for importing mocks
                </Text>

                <FileButton
                    onChange={handleFile}
                    accept="application/json"
                >
                    {(props) => (
                        <Button
                            size="xs"
                            {...props}
                        >
                            Upload file
                        </Button>
                    )}
                </FileButton>
            </Stack>

            {errors && (
                <Stack
                    className={styles.errors}
                    gap={0}
                    align="start"
                >
                    {errors.map((error) => (
                        <Text
                            key={error}
                            c="red"
                            size="sm"
                        >
                            {error}
                        </Text>
                    ))}
                </Stack>
            )}

            {fileContent && (
                <div>
                    <Text size="sm">File preview</Text>

                    <Code
                        block
                        mt="sm"
                        className={styles.file}
                    >
                        {fileContent}
                    </Code>
                </div>
            )}

            {parsedData != null && (
                <Group
                    justify="right"
                    mt="md"
                    gap="xs"
                >
                    <Button
                        type="submit"
                        size="xs"
                        disabled={errors !== null}
                    >
                        Import
                    </Button>
                </Group>
            )}
        </form>
    );
};
