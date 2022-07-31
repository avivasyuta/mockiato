import { ChangeEvent, FC, Fragment, useEffect, useState } from 'react';
import { UseFormReturnType } from '@mantine/form/lib/use-form';
import { ActionIcon, Divider, Grid, Group, Input } from '@mantine/core';
import { IconX } from '@tabler/icons';
import { THeader, TMock } from '../../../../types';
import styles from './Headers.module.css'

type THeadersProps = {
    form: UseFormReturnType<TMock>
    onChange: (headers: THeader[]) => void
}

const emptyHeader = { key: '', value: '' }

export const Headers: FC<THeadersProps> = ({ form, onChange }) => {
    const [headers, setHeaders] = useState<THeader[]>([])
    const [newHeader, setNewHeader] = useState<THeader>({ key: '', value: '' })

    useEffect(() => {
        const collection = [...form.values.responseHeaders]
        if (headers.length === 0) {
            collection.push(emptyHeader)
        }
        setHeaders(collection)
    }, [form.values.responseHeaders])

    const handleDelete = (index: number): void => {
        const newHeaders = form.values.responseHeaders.filter((_, i) => index !== i)
        onChange(newHeaders)
    }

    const handleChangeKey = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const isLast = index === headers.length - 1
        const lastHeader = headers[headers.length - 1]
        const isLastEmpty = lastHeader.key === ''

        const newHeaders = headers.map((header, i) => {
            if (i === index) {
                return { ...header, key: e.target.value }
            }
            return header
        })

        if (isLast && isLastEmpty && e.target.value !== '') {
            newHeaders.push(emptyHeader)
        }

        setHeaders(newHeaders)
    }

    const handleChangeValue = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const newHeaders = form.values.responseHeaders.map((header, i) => {
            if (index === i) {
                return { ...header, value: e.target.value }
            }
            return header
        })
        setHeaders(newHeaders)
    }

    const updateForm = () => onChange(headers)

    return (
        <Fragment>
            {headers.map(({ key, value}, index) => (
                <Group position='left' spacing="xs" mb='xs'>
                    <ActionIcon
                        color="red"
                        disabled={headers.length === 1}
                        onClick={() => handleDelete(index)}
                    >
                        <IconX size={16} />
                    </ActionIcon>

                    <Grid key={index} className={styles.inputs}>
                        <Grid.Col span={6}>
                            <Input
                                value={key}
                                size='xs'
                                onChange={handleChangeKey(index)}
                                onBlur={updateForm}
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Input
                                size='xs'
                                value={value}
                                onChange={handleChangeValue(index)}
                                onBlur={updateForm}
                            />
                        </Grid.Col>
                    </Grid>
                </Group>
            ))}
        </Fragment>
    )
}
