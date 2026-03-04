import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.less';

const App = () => {
  return (
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
