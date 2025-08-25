'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, Card, Button, message } from 'antd'
import { UserOutlined, TeamOutlined, BookOutlined, PlusOutlined } from '@ant-design/icons'

interface TeamData {
  pi: any
  researchers: any[]
  graduates: any[]
}

const TeamManagementTab: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [teamData, setTeamData] = useState<TeamData>({
    pi: null,
    researchers: [],
    graduates: []
  })

  // 获取团队数据
  const fetchTeamData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/team')
      if (!response.ok) {
        throw new Error('获取团队数据失败')
      }
      const data = await response.json()
      setTeamData(data)
    } catch (error) {
      console.error('获取团队数据失败:', error)
      message.error('获取团队数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamData()
  }, [])

  // 刷新数据的回调函数
  const handleDataRefresh = () => {
    fetchTeamData()
  }

  const tabItems = [
    {
      key: 'pi',
      label: (
        <span>
          <UserOutlined />
          负责人
        </span>
      ),
      children: (
        <PIManagement 
          piData={teamData.pi}
          onDataRefresh={handleDataRefresh}
          loading={loading}
        />
      )
    },
    {
      key: 'researchers',
      label: (
        <span>
          <TeamOutlined />
          研究人员
        </span>
      ),
      children: (
        <ResearcherManagement 
          researchers={teamData.researchers}
          onDataRefresh={handleDataRefresh}
          loading={loading}
        />
      )
    },
    {
      key: 'graduates',
      label: (
        <span>
          <GraduationCapOutlined />
          毕业生
        </span>
      ),
      children: (
        <GraduateManagement 
          graduates={teamData.graduates}
          onDataRefresh={handleDataRefresh}
          loading={loading}
        />
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">团队管理</h1>
          <p className="text-gray-600 mt-1">管理实验室团队成员信息</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleDataRefresh}
          loading={loading}
        >
          刷新数据
        </Button>
      </div>

      <Card>
        <Tabs 
          items={tabItems}
          defaultActiveKey="pi"
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
        />
      </Card>
    </div>
  )
}

export default TeamManagementTab