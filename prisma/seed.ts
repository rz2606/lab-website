import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 清理现有数据
  await prisma.user.deleteMany()
  await prisma.news.deleteMany()
  await prisma.tool.deleteMany()
  await prisma.publication.deleteMany()
  await prisma.graduate.deleteMany()
  await prisma.researcher.deleteMany()
  await prisma.pI.deleteMany()

  // 创建默认管理员用户
  const adminPassword = await bcrypt.hash('admin123', 12)
  const userPassword = await bcrypt.hash('user123', 12)
  const editorPassword = await bcrypt.hash('editor123', 12)
  const researcherPassword = await bcrypt.hash('res123', 12)
  const studentPassword = await bcrypt.hash('stu123', 12)
  const inactivePassword = await bcrypt.hash('inactive123', 12)
  
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@lab.edu.cn',
      password: adminPassword,
      roleType: 'admin',
      name: '系统管理员'
    }
  })

  const user = await prisma.user.create({
    data: {
      username: 'user',
      email: 'user@lab.edu.cn',
      password: userPassword,
      roleType: 'user',
      name: '普通用户'
    }
  })

  // 创建更多测试用户
  const editor = await prisma.user.create({
    data: {
      username: 'editor',
      email: 'editor@lab.edu.cn',
      password: editorPassword,
      roleType: 'editor',
      name: '编辑用户'
    }
  })

  const researcher1 = await prisma.user.create({
    data: {
      username: 'researcher1',
      email: 'researcher1@lab.edu.cn',
      password: researcherPassword,
      roleType: 'user',
      name: '研究员1'
    }
  })

  const researcher2 = await prisma.user.create({
    data: {
      username: 'researcher2',
      email: 'researcher2@lab.edu.cn',
      password: researcherPassword,
      roleType: 'user',
      name: '研究员2'
    }
  })

  const student1 = await prisma.user.create({
    data: {
      username: 'student1',
      email: 'student1@lab.edu.cn',
      password: studentPassword,
      roleType: 'user',
      name: '学生1'
    }
  })

  const inactiveUser = await prisma.user.create({
    data: {
      username: 'inactive',
      email: 'inactive@lab.edu.cn',
      password: inactivePassword,
      roleType: 'user',
      name: '非活跃用户'
    }
  })

  // 创建PI数据
  const pi = await prisma.pI.create({
    data: {
      name: '张教授',
      title: '教授，博士生导师',
      email: 'zhang@university.edu.cn',
      photo: '/uploads/pi-avatar.jpg',
      experience: '2015-至今：某大学计算机学院教授\n2010-2015：某研究所副研究员\n2008-2010：博士后研究员',
      positions: '中国计算机学会生物信息学专委会委员\n国际药物信息学会会员\n《生物信息学》期刊编委',
      awards: '2023年：国家自然科学基金优秀青年基金\n2021年：省科技进步二等奖\n2019年：青年科学家奖',
      papers: 'Nature Computational Science (2025)\nBriefings in Bioinformatics (2021)\nJournal of Chemical Information and Modeling (2020)'
    }
  })

  // 创建研究人员数据
  const researchers = await Promise.all([
    prisma.researcher.create({
      data: {
        name: '李博士',
        email: 'li@university.edu.cn',
        photo: '/uploads/researcher1.jpg',
        direction: '分子动力学模拟',
        type: 'postdoc'
      }
    }),
    prisma.researcher.create({
      data: {
        name: '王研究员',
        email: 'wang@university.edu.cn',
        photo: '/uploads/researcher2.jpg',
        direction: '机器学习算法',
        type: 'researcher'
      }
    }),
    prisma.researcher.create({
      data: {
        name: '陈博士',
        email: 'chen@university.edu.cn',
        photo: '/uploads/researcher3.jpg',
        direction: '药物-靶点相互作用',
        type: 'postdoc'
      }
    }),
    prisma.researcher.create({
      data: {
        name: '周硕士',
        email: 'zhou@university.edu.cn',
        direction: '生物信息学',
        type: 'graduate_student'
      }
    }),
    prisma.researcher.create({
      data: {
        name: '吴博士',
        email: 'wu@university.edu.cn',
        photo: '/uploads/researcher4.jpg',
        direction: '计算化学',
        type: 'postdoc'
      }
    }),
    prisma.researcher.create({
      data: {
        name: '张小明',
        email: 'zhangxiaoming@university.edu.cn',
        photo: '/uploads/researcher5.jpg',
        direction: '蛋白质结构预测',
        type: 'researcher'
      }
    }),
    prisma.researcher.create({
      data: {
        name: '刘雅婷',
        email: 'liuyating@university.edu.cn',
        photo: '/uploads/researcher6.jpg',
        direction: '化学信息学',
        type: 'postdoc'
      }
    }),
    prisma.researcher.create({
      data: {
        name: '赵志强',
        email: 'zhaozhiqiang@university.edu.cn',
        direction: '量子化学计算',
        type: 'graduate_student'
      }
    }),
    prisma.researcher.create({
      data: {
        name: '孙丽华',
        email: 'sunlihua@university.edu.cn',
        photo: '/uploads/researcher7.jpg',
        direction: '系统生物学',
        type: 'researcher'
      }
    }),
    prisma.researcher.create({
      data: {
        name: '马建国',
        email: 'majianguo@university.edu.cn',
        direction: '网络药理学',
        type: 'graduate_student'
      }
    })
  ])

  // 创建毕业生数据
  const graduates = await Promise.all([
    prisma.graduate.create({
      data: {
        name: '刘明',
        position: '高级算法工程师',
        email: 'liu.ming@company.com',
        company: '某知名制药公司',
        graduationYear: 2022
      }
    }),
    prisma.graduate.create({
      data: {
        name: '赵丽',
        position: '数据科学家',
        email: 'zhao.li@biotech.com',
        company: '某生物技术公司',
        graduationYear: 2021
      }
    }),
    prisma.graduate.create({
      data: {
        name: '孙强',
        position: '研发总监',
        email: 'sun.qiang@pharma.com',
        company: '某AI制药公司',
        graduationYear: 2020
      }
    }),
    prisma.graduate.create({
      data: {
        name: '马小红',
        position: '产品经理',
        email: 'ma.xiaohong@tech.com',
        company: '某互联网公司',
        graduationYear: 2023
      }
    }),
    prisma.graduate.create({
      data: {
        name: '林志华',
        position: '研究科学家',
        email: 'lin.zhihua@research.org',
        company: '某科研院所',
        graduationYear: 2019
      }
    }),
    prisma.graduate.create({
      data: {
        name: '黄建国',
        position: '技术总监',
        email: 'huang.jianguo@startup.com',
        company: '某创业公司',
        graduationYear: 2018
      }
    }),
    prisma.graduate.create({
      data: {
        name: '王晓东',
        position: '首席科学家',
        email: 'wang.xiaodong@bioai.com',
        company: '某AI生物公司',
        graduationYear: 2017
      }
    }),
    prisma.graduate.create({
      data: {
        name: '李梅',
        position: '高级研究员',
        email: 'li.mei@institute.ac.cn',
        company: '中科院某研究所',
        graduationYear: 2016
      }
    }),
    prisma.graduate.create({
      data: {
        name: '张伟',
        position: '算法专家',
        email: 'zhang.wei@tencent.com',
        company: '腾讯',
        graduationYear: 2021
      }
    }),
    prisma.graduate.create({
      data: {
        name: '陈静',
        position: '生物信息学工程师',
        email: 'chen.jing@genomics.cn',
        company: '华大基因',
        graduationYear: 2020
      }
    }),
    prisma.graduate.create({
      data: {
        name: '周杰',
        position: '机器学习工程师',
        email: 'zhou.jie@baidu.com',
        company: '百度',
        graduationYear: 2022
      }
    }),
    prisma.graduate.create({
      data: {
        name: '吴敏',
        position: '药物化学家',
        email: 'wu.min@novartis.com',
        company: '诺华制药',
        graduationYear: 2019
      }
    })
  ])

  // 创建发表成果数据
  const publications = await Promise.all([
    prisma.publication.create({
      data: {
        title: 'Leveraging Electron Clouds as a Latent Variable to Scale Up Structure: Insect Molecular Design',
        authors: 'Colin Zhang, et al.',
        journal: 'Nature Computational Science',
        year: 2025,
        type: 'paper',
        content: 'accepted'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'BioMedR: An R/CRAN package for integrated data analysis pipeline in biomedical study',
        authors: 'Zhang, C., Liu, S., et al.',
        journal: 'Briefings in Bioinformatics',
        year: 2021,
        type: 'paper',
        content: '22(1): 474-484'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Scopy: An integrated negative design Python library for desirable HT5/V5 database design',
        authors: 'Liu, K., Sun, X., et al.',
        journal: 'Briefings in Bioinformatics',
        year: 2021,
        type: 'paper',
        content: '22(3): bbaa194'
      }
    }),
    prisma.publication.create({
      data: {
        title: '一种基于深度学习的药物分子设计方法',
        authors: '张某某, 李某某, 王某某',
        journal: 'CN202310123456.7',
        year: 2023,
        type: 'patent',
        content: '已授权'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Deep Learning for Drug Discovery: A Comprehensive Review',
        authors: '张三, 李四, 王五',
        journal: 'Nature Reviews Drug Discovery',
        year: 2023,
        type: 'paper',
        content: '22: 123-145'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'A Novel Graph Neural Network Approach for Protein-Ligand Binding Affinity Prediction',
        authors: '李四, 王五, 张三',
        journal: 'Journal of Chemical Information and Modeling',
        year: 2023,
        type: 'paper',
        content: '63(8): 2456-2467'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Transformer-Based Molecular Generation with Multi-Objective Optimization',
        authors: '陈小明, 刘雅婷, 张三',
        journal: 'Nature Machine Intelligence',
        year: 2024,
        type: 'paper',
        content: '6(2): 156-168'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Protein Structure Prediction Using Attention Mechanisms',
        authors: '赵志强, 孙丽华, 李四',
        journal: 'Bioinformatics',
        year: 2023,
        type: 'paper',
        content: '39(15): 3789-3796'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Federated Learning for Privacy-Preserving Drug Discovery',
        authors: '孙丽华, 王五, 陈小明',
        journal: 'Nature Communications',
        year: 2024,
        type: 'paper',
        content: '15: 1234'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Quantum Machine Learning for Molecular Property Prediction',
        authors: '刘雅婷, 赵志强',
        journal: 'Physical Review Letters',
        year: 2023,
        type: 'paper',
        content: '131(12): 120501'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Interpretable AI for Drug-Target Interaction Prediction',
        authors: '张三, 陈小明, 孙丽华, 李四',
        journal: 'Proceedings of NeurIPS 2023',
        year: 2023,
        type: 'conference',
        content: 'pp. 12345-12356'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Large-Scale Virtual Screening Using Distributed Computing',
        authors: '王五, 刘雅婷, 赵志强',
        journal: 'Journal of Computational Chemistry',
        year: 2024,
        type: 'paper',
        content: '45(5): 456-468'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Advances in AI-Driven Drug Design',
        authors: '王五, 张三',
        journal: 'Proceedings of ICML 2023',
        year: 2023,
        type: 'conference',
        content: 'pp. 1234-1245'
      }
    }),
    prisma.publication.create({
      data: {
        title: '基于强化学习的分子优化算法研究',
        authors: '李某某, 张某某, 陈某某',
        journal: 'CN202310234567.8',
        year: 2023,
        type: 'patent',
        content: '申请中'
      }
    }),
    prisma.publication.create({
      data: {
        title: 'Multi-Modal Learning for Drug Repurposing',
        authors: '陈小明, 张三, 孙丽华',
        journal: 'Cell',
        year: 2024,
        type: 'paper',
        content: '187(8): 2123-2138'
      }
    })
  ])

  // 创建工具数据
  const tools = await Promise.all([
    prisma.tool.create({
      data: {
        name: 'BioMedR',
        description: 'An R/CRAN package for integrated data analysis pipeline in biomedical study.',
        category: '数据分析',
        url: 'https://cran.r-project.org/web/packages/BioMedR/',
        reference: 'Briefings in Bioinformatics, 2021, 22(1): 474-484',
        image: 'https://example.com/biomedR.png',
        tags: 'R语言,生物医学,数据集成,统计分析',
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.tool.create({
      data: {
        name: 'Scopy',
        description: 'An integrated negative design Python library for desirable HT5/V5 database design.',
        category: '分子设计',
        url: 'https://github.com/kotorl-y/Scopy/',
        reference: 'Briefings in Bioinformatics, 2021, 22(3): bbaa194',
        image: 'https://example.com/scopy.png',
        tags: 'Python,分子筛选,负向设计,数据库构建',
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.tool.create({
      data: {
        name: 'DrugAI',
        description: 'A comprehensive platform for AI-driven drug discovery and molecular optimization.',
        category: '人工智能',
        url: 'https://github.com/lab/drugai',
        reference: 'Nature Machine Intelligence, 2023, 5(2): 123-135',
        image: 'https://example.com/drugai.png',
        tags: '深度学习,分子生成,性质预测,优化算法',
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.tool.create({
      data: {
        name: 'MolViz',
        description: '分子可视化工具，支持多种分子格式的3D展示和交互式操作。',
        category: '可视化',
        url: 'https://github.com/lab/molviz',
        reference: 'Journal of Cheminformatics, 2022, 14(1): 25',
        image: 'https://example.com/molviz.png',
        tags: '分子可视化,3D展示,交互式操作,多格式支持',
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.tool.create({
      data: {
        name: 'ProteinFold',
        description: '基于深度学习的蛋白质结构预测工具，能够快速准确地预测蛋白质三维结构。',
        category: '结构预测',
        url: 'https://proteinfold.lab.edu.cn',
        reference: 'Nature Methods, 2023, 20(4): 567-578',
        image: 'https://example.com/proteinfold.png',
        tags: '蛋白质折叠,结构预测,深度学习,三维结构',
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.tool.create({
      data: {
        name: 'ChemDB',
        description: '化学分子数据库管理系统，提供高效的分子存储、检索和分析功能。',
        category: '数据库',
        url: 'https://chemdb.lab.edu.cn',
        reference: 'Nucleic Acids Research, 2023, 51(D1): D1234-D1240',
        image: 'https://example.com/chemdb.png',
        tags: '分子数据库,化学信息,数据管理,检索分析',
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.tool.create({
      data: {
        name: 'BioAnalyzer',
        description: '生物医学数据分析平台，集成多种统计分析和机器学习算法。',
        category: '数据分析',
        url: 'https://bioanalyzer.lab.edu.cn',
        reference: 'Bioinformatics, 2022, 38(15): 3789-3796',
        image: 'https://example.com/bioanalyzer.png',
        tags: '生物医学,数据分析,统计分析,机器学习',
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.tool.create({
      data: {
        name: 'MolGen',
        description: '基于生成对抗网络的新型分子生成工具，能够设计具有特定性质的化合物。',
        category: '分子设计',
        reference: 'Journal of Chemical Information and Modeling, 2023, 63(8): 2456-2467',
        tags: '生成对抗网络,分子生成,化合物设计,GAN',
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.tool.create({
      data: {
        name: 'AIPredict',
        description: '人工智能药物活性预测平台，支持多种机器学习模型的训练和预测。',
        category: '人工智能',
        url: 'https://aipredict.lab.edu.cn',
        reference: 'Drug Discovery Today, 2023, 28(2): 103532',
        image: 'https://example.com/aipredict.png',
        tags: '人工智能,药物活性,预测模型,机器学习',
        createdBy: user.id,
        updatedBy: user.id
      }
    }),
    prisma.tool.create({
      data: {
        name: 'StructAlign',
        description: '蛋白质结构比对工具，提供快速准确的结构相似性分析。',
        category: '结构预测',
        reference: 'Proteins: Structure, Function, and Bioinformatics, 2022, 90(12): 2234-2245',
        tags: '蛋白质结构,结构比对,相似性分析,生物信息学',
        createdBy: user.id,
        updatedBy: user.id
      }
    })
  ])

  // 创建新闻数据
  const news = await Promise.all([
    prisma.news.create({
      data: {
        title: '【重要通知】课题组在Nature Computational Science发表重要研究成果',
        content: '我们的最新研究"Leveraging Electron Clouds as a Latent Variable to Scale Up Structure: Insect Molecular Design"被Nature Computational Science接收发表。这项研究提出了一种创新的分子设计方法，通过将电子云作为潜在变量来扩展结构设计，在昆虫分子设计领域取得了重要突破。\n\n该研究的主要贡献包括：\n1. 提出了基于电子云的分子表示方法\n2. 开发了高效的分子生成算法\n3. 在多个基准数据集上取得了最优性能\n\n这一成果标志着我们在计算化学和人工智能交叉领域的重要进展。',
        summary: '我们的最新研究被Nature Computational Science接收发表，在分子设计领域取得重要突破。',
        image: '/uploads/nature-paper.jpg',
        isPinned: true,
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.news.create({
      data: {
        title: '【重大喜讯】课题组获得国家自然科学基金重点项目资助',
        content: '我们申请的"基于人工智能的智能化药物设计关键技术研究"项目获得国家自然科学基金重点项目资助，资助金额300万元。该项目将重点研究基于深度学习的分子生成算法、药物-靶点相互作用预测模型以及多目标药物优化方法。\n\n项目研究内容：\n- 基于图神经网络的分子表示学习\n- 多模态药物-靶点相互作用预测\n- 强化学习驱动的分子优化\n- 可解释性AI在药物设计中的应用\n\n该项目的成功获批将为我们在AI药物设计领域的深入研究提供重要支撑。',
        summary: '获得国家自然科学基金重点项目资助300万元，将推进AI药物设计技术研究。',
        image: '/uploads/nsfc-funding.jpg',
        isPinned: true,
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.news.create({
      data: {
        title: '课题组在国际生物信息学会议ISMB 2024上发表多篇论文',
        content: '在刚刚结束的国际生物信息学会议ISMB 2024上，我们课题组共有3篇论文被接收，涵盖了蛋白质结构预测、药物重定位和基因调控网络分析等多个研究方向。\n\n接收论文包括：\n1. "Deep Learning for Protein-Ligand Binding Affinity Prediction"\n2. "Graph Neural Networks for Drug Repurposing"\n3. "Attention Mechanisms in Gene Regulatory Network Inference"\n\n这些成果展示了我们在计算生物学领域的综合实力。',
        summary: '课题组在ISMB 2024会议上发表3篇论文，展示在计算生物学领域的研究实力。',
        image: '/uploads/ismb-2024.jpg',
        isPinned: false,
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.news.create({
      data: {
        title: '新版BioMedR软件包正式发布',
        content: 'BioMedR 2.0版本正式在CRAN上发布！新版本增加了多项重要功能：\n\n主要更新：\n- 新增深度学习模块，支持神经网络模型训练\n- 优化分子描述符计算算法，提升计算效率50%\n- 增加可视化功能，支持交互式图表生成\n- 完善文档和教程，提供更好的用户体验\n\n欢迎广大用户下载使用并提供反馈意见。',
        summary: 'BioMedR 2.0版本正式发布，新增深度学习模块和可视化功能。',
        image: '/uploads/biomedR-v2.jpg',
        isPinned: false,
        createdBy: user.id,
        updatedBy: user.id
      }
    }),
    prisma.news.create({
      data: {
        title: '课题组成员获得优秀博士学位论文奖',
        content: '恭喜我们课题组博士毕业生刘明同学的学位论文"基于深度学习的药物分子生成与优化研究"获得校级优秀博士学位论文奖！\n\n该论文的主要贡献：\n- 提出了新颖的分子生成模型架构\n- 开发了多目标分子优化算法\n- 在多个药物设计任务上验证了方法的有效性\n\n刘明同学现已入职某知名制药公司担任高级算法工程师。',
        summary: '课题组博士毕业生刘明获得校级优秀博士学位论文奖。',
        isPinned: false,
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.news.create({
      data: {
        title: '课题组与国际知名制药公司建立合作关系',
        content: '我们很高兴宣布，课题组与国际知名制药公司XYZ Pharma正式建立战略合作关系。双方将在AI驱动的药物发现领域开展深度合作。\n\n合作内容包括：\n- 联合开展新药研发项目\n- 共享数据资源和计算平台\n- 人才交流和培养计划\n- 技术转移和产业化推进\n\n这一合作将为我们的研究成果转化提供重要平台。',
        summary: '课题组与国际知名制药公司建立战略合作关系，推进AI药物发现产业化。',
        image: '/uploads/pharma-cooperation.jpg',
        isPinned: false,
        createdBy: admin.id,
        updatedBy: admin.id
      }
    }),
    prisma.news.create({
      data: {
        title: '课题组举办第三届计算药物设计研讨会',
        content: '第三届计算药物设计研讨会将于2024年6月15-16日在我校举办。本次会议邀请了国内外知名专家学者，围绕AI药物设计、分子模拟、生物信息学等前沿话题进行深入交流。\n\n会议议题：\n- 深度学习在药物发现中的应用\n- 分子动力学模拟新方法\n- 蛋白质结构预测与设计\n- 药物安全性评估\n\n欢迎相关领域的研究人员报名参加。',
        summary: '第三届计算药物设计研讨会将于6月15-16日举办，欢迎报名参加。',
        isPinned: false,
        createdBy: user.id,
        updatedBy: user.id
      }
    }),
    prisma.news.create({
      data: {
        title: '课题组开源新工具：MolecularAI平台',
        content: '我们很高兴宣布开源我们最新开发的MolecularAI平台！这是一个集成了多种AI算法的分子设计和分析平台。\n\n平台特色：\n- 支持多种分子生成算法（VAE、GAN、Transformer等）\n- 提供丰富的分子性质预测模型\n- 集成分子可视化和分析工具\n- 支持云端部署和本地安装\n\n项目已在GitHub开源，欢迎下载使用和贡献代码。',
        summary: '课题组开源MolecularAI平台，集成多种AI算法用于分子设计和分析。',
        image: '/uploads/molecularai-platform.jpg',
        isPinned: false,
        createdBy: admin.id,
        updatedBy: admin.id
      }
    })
  ])

  console.log('数据库种子数据创建完成！')
  console.log(`创建了 ${admin ? 1 : 0} 个管理员用户`)
  console.log(`创建了 ${user ? 1 : 0} 个普通用户`)
  console.log(`创建了 ${editor ? 1 : 0} 个编辑用户`)
  console.log(`创建了 ${researcher1 ? 1 : 0} + ${researcher2 ? 1 : 0} + ${student1 ? 1 : 0} + ${inactiveUser ? 1 : 0} 个其他测试用户`)
  console.log(`创建了 ${pi ? 1 : 0} 个PI记录`)
  console.log(`创建了 ${researchers.length} 个研究人员记录`)
  console.log(`创建了 ${graduates.length} 个毕业生记录`)
  console.log(`创建了 ${publications.length} 个发表成果记录`)
  console.log(`创建了 ${tools.length} 个工具记录`)
  console.log(`创建了 ${news.length} 个新闻记录`)
  console.log('\n=== 测试账户信息 ===')
  console.log('管理员账户: admin / admin123')
  console.log('普通用户账户: user / user123')
  console.log('编辑用户账户: editor / editor123')
  console.log('研究员账户: researcher1 / res123, researcher2 / res123')
  console.log('学生账户: student1 / stu123')
  console.log('非活跃用户: inactive / inactive123 (已禁用)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })