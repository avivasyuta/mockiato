import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Input, Form, Select, Button } from 'antd';
import 'antd/dist/antd.css';
import { MockStatus, TMock } from './types';
import { db } from './database';

export const App = () => {
    const [url, setURL] = useState<string>();
    const [method, setMethod] = useState<string>();
    const [code, setCode] = useState<number>();
    const [response, setResponse] = useState<string>();

    const handleChangeUrl = (e: ChangeEvent<HTMLInputElement>) => {
        setURL(e.target.value);
    }

    const handleChangeMethod = (value: string) => {
        setMethod(value);
    }

    const handleChangeCode = (e: ChangeEvent<HTMLInputElement>) => {
        setCode(Number(e.target.value));
    }

    const handleChangeResponse = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setCode(Number(e.target.value));
    }

    const onFinish = async (form: TMock) => {
        // TODO разобраться с обработкой формы
        const id = await db.mocks.add({
            ...form,
            httpStatus: Number(form.httpStatus),
            status: MockStatus.ACTIVE
        })
    };

    const mocks = useLiveQuery(
        () => db.mocks.toArray()
    );

    return (
        <div style={{width: '900px'}}>
            <Form
                name="add-mock"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                autoComplete="off"
                onFinish={onFinish}
            >
                <Form.Item
                    label="URL"
                    name="url"
                    rules={[{required: true, message: 'Please input url'}]}
                >
                    <Input value={url} onChange={handleChangeUrl}/>
                </Form.Item>

                <Form.Item
                    label="HTTP method"
                    name="httpMethod"
                    rules={[{required: true, message: 'Please select method'}]}
                >
                    <Select value={method} onChange={handleChangeMethod}>
                        <Select.Option value="GET">GET</Select.Option>
                        <Select.Option value="POST">POST</Select.Option>
                        <Select.Option value="PATCH">PATCH</Select.Option>
                        <Select.Option value="PUT">PUT</Select.Option>
                        <Select.Option value="DELETE">DELETE</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Response code"
                    name="httpStatus"
                    rules={[{required: true, message: 'Please input response code'}]}
                >
                    <Input value={code} onChange={handleChangeCode}/>
                </Form.Item>

                <Form.Item
                    label="Response"
                    name="response"
                >
                    <Input.TextArea value={response} onChange={handleChangeResponse}/>
                </Form.Item>

                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

            {mocks?.map(mock => (
                <div key={mock.id}>{mock.httpMethod} {mock.url} {mock.httpStatus} {mock.response} {mock.status}</div>
            ))}
        </div>
    )
}
