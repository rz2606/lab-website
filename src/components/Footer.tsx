import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 课题组信息 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">智能化药物研发加速器</h3>
            <p className="text-gray-300 mb-4">
              致力于利用人工智能和计算生物学技术，加速药物发现和开发过程，
              为人类健康事业贡献力量。
            </p>
            <div className="text-sm text-gray-400">
              <p>© 2024 智能化药物研发加速器课题组. 保留所有权利.</p>
              <p>备案号: 京ICP备xxxxxxxx号</p>
            </div>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="text-md font-semibold mb-4">联系方式</h4>
            <div className="text-gray-300 space-y-2">
              <p>邮箱: contact@lab.edu.cn</p>
              <p>电话: +86-xxx-xxxx-xxxx</p>
              <p>地址: 北京市海淀区xxx路xxx号</p>
            </div>
          </div>

          {/* 友情链接 */}
          <div>
            <h4 className="text-md font-semibold mb-4">相关链接</h4>
            <div className="space-y-2">
              <Link 
                href="https://cran.r-project.org/web/packages/BioMedR/" 
                className="block text-gray-300 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                BioMedR
              </Link>
              <Link 
                href="https://github.com/kotorl-y/Scopy/" 
                className="block text-gray-300 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Scopy
              </Link>
              <Link 
                href="/tools" 
                className="block text-gray-300 hover:text-white transition-colors"
              >
                更多工具
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>Powered by Next.js & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer