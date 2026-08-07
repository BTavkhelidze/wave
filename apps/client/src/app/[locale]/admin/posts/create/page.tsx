'use client';

import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, Row, Col } from 'antd';

export default function PostCreate() {
  const { formProps, saveButtonProps } = useForm({
    redirect: 'list',
    defaultFormValues: {
      status: 'draft',
    },
  });

  return (
    <Create title='Create New Post' saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout='vertical'>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Title' name='title' rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label='Slug' name='slug' rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='Status' name='status'>
          <Select
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
            ]}
          />
        </Form.Item>

        <Form.Item label='Content' name='content'>
          <Input.TextArea rows={6} />
        </Form.Item>

        <Form.Item label='Image URL' name='image_url'>
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
}
