import { ArrowRight, Beaker, Users, BookOpen, Code } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              智能化药物研发
              <span className="text-blue-600">加速器</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              利用人工智能和计算生物学技术，加速药物发现和开发过程，为人类健康事业贡献力量
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/team"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                了解团队
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/tools"
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                查看工具
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              研究领域与成果
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              我们专注于多个前沿研究方向，致力于推动药物研发技术的创新与发展
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Beaker className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">药物设计</h3>
              <p className="text-gray-600">
                基于AI的分子设计与优化，加速先导化合物发现
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">团队协作</h3>
              <p className="text-gray-600">
                跨学科团队合作，整合多领域专业知识
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">学术成果</h3>
              <p className="text-gray-600">
                高质量论文发表与专利申请，推动学术进步
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">工具开发</h3>
              <p className="text-gray-600">
                开源软件工具开发，服务全球科研社区
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">发表论文</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">20+</div>
              <div className="text-gray-600">开发工具</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
              <div className="text-gray-600">团队成员</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">5+</div>
              <div className="text-gray-600">合作机构</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            加入我们的研究之旅
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            探索最新的研究成果，了解我们的开源工具，或与我们的团队取得联系
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/publications"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              查看发表成果
            </Link>
            <Link
              href="/news"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              最新动态
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
