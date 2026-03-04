import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import moment from 'moment';
import 'moment/locale/zh-cn';
import AppRouter from '@/router';
import './index.less';

// 设置 dayjs 全局语言为中文 (antd 5/6 默认使用 dayjs 处理日期)
dayjs.locale('zh-cn');
// 设置 moment 全局语言为中文 (如果项目中其他地方使用了 moment)
moment.locale('zh-cn');

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ConfigProvider locale={zhCN}>
        <AppRouter />
      </ConfigProvider>
    </React.StrictMode>
  );
}
