import React from 'react';
import { Layout, Menu } from 'antd';
import { SettingOutlined, PlayCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import './index.less';

const { Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    { key: '/list', icon: <LineChartOutlined />, label: '爬虫列表' },
    { key: '/settings', icon: <SettingOutlined />, label: '开始爬虫' },
    { key: '/runner', icon: <PlayCircleOutlined />, label: '爬虫运行' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
