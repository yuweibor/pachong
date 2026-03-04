import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from '@/components/Layout';

const Settings = React.lazy(() => import('@/pages/Settings'));
const Runner = React.lazy(() => import('@/pages/Runner'));
const Results = React.lazy(() => import('@/pages/Results'));
const List = React.lazy(() => import('@/pages/List'));

const AppRouter = () => {
  return (
    <HashRouter>
      <Suspense
        fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index path="list" element={<List />} />
            <Route path="settings" element={<Settings />} />
            <Route path="runner" element={<Runner />} />
            <Route path="results" element={<Results />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default AppRouter;
