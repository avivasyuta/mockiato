import { FC, useEffect, useRef } from 'react';
import JSONComponent from 'jsoneditor';
import cn from 'classnames';
import { useMantineTheme } from '@mantine/core';
import 'jsoneditor/dist/jsoneditor.min.css';
import styles from './JSONEditor.module.css';

type JSONEditorProps = {
    value?: string
    error?: string
    onChange: (value: string) => void
}

export const JSONEditor: FC<JSONEditorProps> = ({ value, error, onChange }) => {
    const editorRef = useRef<JSONComponent | null>(null);
    const theme = useMantineTheme();

    const classNames = cn(styles.editor, {
        [styles['editor-error']]: error !== undefined,
    });

    useEffect(() => {
        const container = document.getElementById('json-editor');
        if (!container) {
            return undefined;
        }

        editorRef.current = new JSONComponent(container, {
            mode: 'code',
            mainMenuBar: false,
            statusBar: false,
            onChangeText: onChange,
        });

        return () => {
            editorRef.current?.destroy();
        };
    }, []);

    useEffect(() => {
        // init value if exists
        if (value) {
            editorRef.current?.setText(value);
        }

        if (theme.colorScheme === 'dark') {
            import('./JSONEditor-dark.css');
        } else {
            import('./JSONEditor-light.css');
        }
    }, []);

    return (
        <div id="json-editor" className={classNames} />
    );
};
