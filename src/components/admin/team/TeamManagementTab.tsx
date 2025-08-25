'use client'

import React, { useState } from 'react'
import { Tabs, Button, Space } from 'antd'
import { UserOutlined, TeamOutlined, BookOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTeamData } from '@/hooks/useTeamData'
import PIManagement from './PIManagement'
import ResearcherManagement from './ResearcherManagement'
import GraduateManagement from './GraduateManagement'

interface TeamManagementTabProps {
  // 可以添加其他props
}

const TeamManagementTab: React.FC<TeamManagementTabProps> = () => {
  const [activeTab, setActiveTab] = useState('pi')
  const { data: teamData, loading, refreshData, fetchData } = useTeamData()

  // 初始化数据获取
  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">团队管理</h1>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refreshData}
            loading={loading}
          >
            刷新数据
          </Button>
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        size="large"
      >
        <Tabs.TabPane tab={<span><UserOutlined />负责人</span>} key="pi">
          <PIManagement 
            piData={teamData?.pi || null}
            onDataRefresh={refreshData}
            loading={loading}
          />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab={<span><TeamOutlined />研究人员</span>} key="researchers">
          <ResearcherManagement 
            researchers={teamData?.researchers || []}
            onDataRefresh={refreshData}
            loading={loading}
          />
        </Tabs.TabPane>
        
        <Tabs.TabPane tab={<span><BookOutlined />毕业生</span>} key="graduates">
          <GraduateManagement 
            graduates={teamData?.graduates || []}
            onDataRefresh={refreshData}
            loading={loading}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

export default TeamManagementTab