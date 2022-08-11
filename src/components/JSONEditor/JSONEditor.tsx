import { FC, useEffect, useRef } from 'react';
import JSONComponent from 'jsoneditor';
import cn from 'classnames';
import 'jsoneditor/dist/jsoneditor.min.css';
import styles from './JSONEditor.module.css';

import('./JSONEditor.css');

type JSONEditorProps = {
    value?: string
    onChange: (value: string) => void
}

export const JSONEditor: FC<JSONEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<JSONComponent | null>(null);

    const classNames = cn(styles.editor);

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
    }, []);

    return (
        <div id="json-editor" className={classNames} />
    );
};
