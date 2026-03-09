import React from 'react';
import { Form, Input, InputNumber, Button, Select, Space, DatePicker, Modal } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import { pachongApi } from '@/api';

const { Option } = Select;
const { RangePicker } = DatePicker;




import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const runPachong = async (values: any) => {
    try {
      const filePath = await pachongApi.saveConfig(values);
      console.log('配置文件已保存到:', filePath);
      
      await pachongApi.run(values);
      
      // 跳转到 Runner 页面，并传递任务名称
      navigate('/runner', { state: { taskName: values.name } });

    } catch (error) {
      console.error('调用主进程失败:', error);
      Modal.error({ title: '任务启动失败', content: '无法连接到主进程，请检查控制台输出。' });
    }
  };

  const onFinish = (values: any) => {
    console.log('Form Submitted:', values);
    Modal.confirm({
      title: '开始新的爬虫任务？',
      content: '确认后将在后台开始执行爬虫。',
      onOk: () => runPachong(values),
    });
  };

  const initialValues = {
    name: `爬虫${moment().format('YYYY-MM-DD')}`,
    maxPages: 100,
    keywords: [''],
  };

  return (
    <Form
      form={form}
      name="crawler_settings"
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      autoComplete="off"
    >
      {/* ... other form items ... */}
      <Form.Item
        name="name"
        label="任务名称"
        rules={[{ required: true, message: '请输入任务名称' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="targetUrl"
        label="目标网址"
        rules={[
          { required: true, message: '请输入目标网址' },
          { type: 'url', message: '请输入有效的网址' },
        ]}
      >
        <Input placeholder="例如: https://www.example.com" />
      </Form.Item>

      <Form.List
        name="keywords"
        rules={[
          {
            validator: async (_, keywords) => {
              if (!keywords || keywords.length < 1) {
                return Promise.reject(new Error('至少需要一个关键词'));
              }
              if (keywords.length > 10) {
                return Promise.reject(new Error('最多只能添加十个关键词'));
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                label={index === 0 ? '关键词' : ''}
                required={false}
                key={field.key}
              >
                <Space align="baseline">
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "请输入关键词或删除此项",
                      },
                    ]}
                    noStyle
                  >
                    <Input placeholder="请输入关键词" style={{ width: '300px' }} />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      onClick={() => remove(field.name)}
                    />
                  ) : null}
                </Space>
              </Form.Item>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                style={{ width: '300px' }}
                icon={<PlusOutlined />}
                disabled={fields.length >= 10}
              >
                添加关键词
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item
        name="maxPages"
        label="最大页面数"
        rules={[{ required: true, message: '请输入最大页面数' }]}
      >
        <InputNumber min={1} max={1000} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="dateRange" label="日期范围 (可选)">
        <RangePicker style={{ width: '100%' }} allowClear />
      </Form.Item>

      <Form.Item name="language" label="语言 (可选)">
        <Select placeholder="请选择语言" allowClear>
          <Option value="zh-CN">简体中文</Option>
          <Option value="en">English</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Settings;
