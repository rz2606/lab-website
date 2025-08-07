# Lab Website 自动安装指南

本文档介绍如何使用自动安装脚本快速部署 Lab Website 系统。

## 系统要求

- Node.js 18+ 
- npm 或 pnpm
- Git
- MySQL 数据库

## 快速安装

### 1. 运行安装脚本

```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/365code365/lab-website/main/install.sh | bash

# 或者手动下载脚本
wget https://raw.githubusercontent.com/365code365/lab-website/main/install.sh
chmod +x install.sh
./install.sh
```

### 2. 访问安装页面

脚本运行完成后，访问 `http://localhost:3000` 将自动跳转到安装页面。

### 3. 配置数据库

在安装页面的第一步中：

1. **数据库主机**: 通常为 `localhost`
2. **端口**: MySQL 默认端口 `3306`
3. **用户名**: 数据库用户名
4. **密码**: 数据库密码
5. **数据库名**: 建议使用 `lab_website`

点击「测试连接并继续」按钮验证数据库连接。

### 4. 创建管理员账户

在第二步中设置系统管理员账户：

1. **用户名**: 管理员登录用户名
2. **邮箱**: 管理员邮箱地址
3. **姓名**: 管理员显示名称
4. **密码**: 至少6位密码
5. **确认密码**: 重复输入密码

### 5. 完成安装

第三步将自动执行以下操作：

- 保存数据库配置到 `.env` 文件
- 运行 Prisma 数据库迁移
- 创建数据库表结构
- 创建管理员账户
- 标记系统安装完成

安装完成后，系统将自动跳转到登录页面。

## 手动安装（可选）

如果自动安装脚本无法正常工作，可以手动执行以下步骤：

### 1. 克隆仓库

```bash
git clone https://github.com/365code365/lab-website.git
cd lab-website
```

### 2. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
DATABASE_URL="mysql://username:password@localhost:3306/lab_website"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
SYSTEM_INSTALLED="false"
```

### 4. 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

### 5. 访问安装页面

打开浏览器访问 `http://localhost:3000`，按照页面提示完成安装。

## 数据库准备

在运行安装脚本之前，请确保：

1. MySQL 服务已启动
2. 已创建目标数据库（如 `lab_website`）
3. 数据库用户具有足够的权限

### 创建数据库示例

```sql
-- 登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE lab_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选）
CREATE USER 'labuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON lab_website.* TO 'labuser'@'localhost';
FLUSH PRIVILEGES;
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证用户名和密码
   - 确认数据库名称是否存在

2. **端口被占用**
   - 检查 3000 端口是否被其他服务占用
   - 可以修改 `package.json` 中的启动端口

3. **权限错误**
   - 确保安装脚本有执行权限
   - 检查数据库用户权限

4. **依赖安装失败**
   - 检查网络连接
   - 尝试使用不同的包管理器（npm/pnpm）
   - 清除缓存后重试

### 重新安装

如需重新安装系统：

1. 删除 `.env` 文件
2. 删除 `.installed` 文件
3. 清空数据库表
4. 重新访问 `http://localhost:3000`

## 生产环境部署

生产环境部署请参考以下步骤：

1. 设置环境变量 `NODE_ENV=production`
2. 配置生产数据库连接
3. 运行 `npm run build` 构建项目
4. 使用 `npm start` 启动生产服务器
5. 配置反向代理（如 Nginx）
6. 设置 SSL 证书

## 支持

如果在安装过程中遇到问题，请：

1. 查看控制台错误信息
2. 检查数据库连接日志
3. 提交 Issue 到 GitHub 仓库
4. 联系技术支持团队

---

**注意**: 请确保在生产环境中使用强密码和安全的数据库配置。