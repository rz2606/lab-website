'use client'
import { useState, useEffect } from 'react'
import { Calendar, Pin, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  image: string | null
  isPinned: boolean
  createdAt: string
  updatedAt: string
  author: string
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/news?limit=4')
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      const data = await response.json()
      setNews(data.data || [])
    } catch (err) {
      console.error('Error fetching news:', err)
      setError('Failed to load news')
      // 使用模拟数据作为后备
      setNews([
        {
          id: '1',
          title: 'AI驱动的药物分子设计新突破',
          summary: '我们的研究团队在人工智能辅助药物分子设计领域取得重大进展，成功开发出新型深度学习模型，能够显著提高药物候选分子的预测准确性。',
          content: '',
          image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20molecular%20drug%20design%20breakthrough%20laboratory%20research%20modern%20scientific%20equipment&image_size=landscape_4_3',
          isPinned: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          author: '张教授'
        },
        {
          id: '2',
          title: '国际合作项目启动仪式成功举办',
          summary: '实验室与多个国际知名研究机构签署合作协议，共同推进计算生物学与药物发现领域的前沿研究。',
          content: '',
          image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=international%20collaboration%20ceremony%20laboratory%20scientists%20handshake%20modern%20conference%20room&image_size=landscape_4_3',
          isPinned: false,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          author: '李博士'
        },
        {
          id: '3',
          title: '新型抗癌药物候选分子发现',
          summary: '通过计算机辅助药物设计，我们发现了一系列具有潜在抗癌活性的新型化合物，目前正在进行进一步的实验验证。',
          content: '',
          image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anticancer%20drug%20discovery%20molecular%20structure%20laboratory%20research%20scientific%20breakthrough&image_size=landscape_4_3',
          isPinned: false,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          author: '王研究员'
        },
        {
          id: '4',
          title: '学术论文在顶级期刊发表',
          summary: '实验室最新研究成果在Nature Biotechnology期刊发表，为计算药物设计领域提供了新的理论基础和方法学指导。',
          content: '',
          image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=scientific%20publication%20journal%20research%20paper%20academic%20achievement%20laboratory&image_size=landscape_4_3',
          isPinned: false,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          author: '陈教授'
        }
      ])
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && news.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">暂时无法加载新闻内容</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {news.map((item, index) => (
        <NewsCard key={item.id} news={item} index={index} />
      ))}
    </div>
  )
}

interface NewsCardProps {
  news: NewsItem
  index: number
}

function NewsCard({ news, index }: NewsCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100)
    return () => clearTimeout(timer)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="relative h-48 overflow-hidden">
        {news.image ? (
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="text-blue-500 text-4xl font-bold">新闻</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {news.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {news.summary}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(news.createdAt)}</span>
          </div>
          <span className="text-blue-600 font-medium">{news.author}</span>
        </div>
        
        <Link
          href={`/news/${news.id}`}
          className="group/link inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          阅读更多
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}