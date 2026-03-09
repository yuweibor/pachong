import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Tag, Button, Space } from 'antd';
import { pachongApi } from '@/api';

const Runner = () => {
  const location = useLocation();
  const taskName = location.state?.taskName || '未命名任务';
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState('运行中');

  const handleStop = async () => {
    try {
      await pachongApi.stop();
    } catch (error) {
      console.error('停止爬虫失败:', error);
    }
  };

  useEffect(() => {
    const handleUpdate = (newResult: any) => {
      setResults(prevResults => [...prevResults, { ...newResult, key: Date.now() }]);
    };

    const handleDone = (doneMessage: any) => {
      setStatus(doneMessage.message);
    };

    // 订阅事件
    pachongApi.onCrawlerUpdate(handleUpdate);
    pachongApi.onCrawlerDone(handleDone);

    // 组件卸载时取消订阅
    return () => {
      // 可以在这里添加取消监听的逻辑
    };
  }, []);

  const columns = [
    {
      title: '目标页面',
      dataIndex: 'targetPage',
      key: 'targetPage',
    },
    {
      title: '命中关键词',
      dataIndex: 'targetKeyword',
      key: 'targetKeyword',
      render: (keyword: string) => <Tag color="blue">{keyword}</Tag>,
    },
    {
      title: '出现次数',
      dataIndex: 'times',
      key: 'times',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>任务: {taskName} - <Tag color={status === '运行中' ? 'green' : 'red'}>{status}</Tag></h2>
        <Space>
          <Button 
            danger 
            type="primary" 
            onClick={handleStop} 
            disabled={status !== '运行中'}
          >
            停止爬虫
          </Button>
        </Space>
      </div>
      <Table dataSource={results} columns={columns} pagination={false} />
    </div>
  );
};

export default Runner;
