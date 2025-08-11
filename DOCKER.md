# Lab Website Docker 部署指南

本文档介绍如何使用 Docker 部署 Lab Website 项目。

## 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/365code365/lab-website.git
cd lab-website
```

### 2. 配置环境变量

复制并编辑环境变量文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置以下关键变量：

```env
# 数据库配置
DATABASE_URL=mysql://lab_user:lab_password@mysql:3306/lab_website

# NextAuth 配置
NEXTAUTH_SECRET=your-very-secure-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# 系统配置
SYSTEM_INSTALLED=true
```

### 3. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 初始化数据库

等待 MySQL 服务完全启动后，执行数据库迁移：

```bash
# 进入应用容器
docker-compose exec app sh

# 执行数据库迁移
npx prisma migrate deploy

# 生成 Prisma 客户端
npx prisma generate

# 退出容器
exit
```

### 5. 访问应用

- **主应用**: http://localhost:3000
- **Prisma Studio** (可选): http://localhost:5555

## 服务说明

### MySQL 数据库

- **容器名**: `lab-website-mysql`
- **端口**: 3306
- **数据库**: `lab_website`
- **用户**: `lab_user`
- **密码**: `lab_password`
- **数据持久化**: 通过 Docker volume `mysql_data`

### Lab Website 应用

- **容器名**: `lab-website-app`
- **端口**: 3000
- **环境**: production
- **健康检查**: `/api/health` 端点

### Prisma Studio (可选)

- **容器名**: `lab-website-prisma-studio`
- **端口**: 5555
- **用途**: 数据库可视化管理
- **启动方式**: `docker-compose --profile tools up prisma-studio`

## 常用命令

### 服务管理

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs [service_name]

# 实时查看日志
docker-compose logs -f [service_name]
```

### 数据库管理

```bash
# 连接到 MySQL
docker-compose exec mysql mysql -u lab_user -p lab_website

# 备份数据库
docker-compose exec mysql mysqldump -u lab_user -p lab_website > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u lab_user -p lab_website < backup.sql
```

### 应用管理

```bash
# 进入应用容器
docker-compose exec app sh

# 查看应用日志
docker-compose logs -f app

# 重新构建应用镜像
docker-compose build app

# 强制重新构建
docker-compose build --no-cache app
```

## 生产环境部署

### 1. 安全配置

在生产环境中，请确保：

- 修改默认密码
- 使用强密码和安全的 secret
- 配置防火墙规则
- 启用 HTTPS
- 定期备份数据

### 2. 环境变量配置

创建生产环境的 `.env` 文件：

```env
# 数据库配置（使用强密码）
DATABASE_URL=mysql://prod_user:very_secure_password@mysql:3306/lab_website

# NextAuth 配置
NEXTAUTH_SECRET=very-long-and-secure-secret-key-for-production
NEXTAUTH_URL=https://your-domain.com

# 系统配置
SYSTEM_INSTALLED=true
NODE_ENV=production
```

### 3. 使用生产配置

```bash
# 使用生产配置文件
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查 MySQL 服务状态
   docker-compose logs mysql
   
   # 检查网络连接
   docker-compose exec app ping mysql
   ```

2. **应用启动失败**
   ```bash
   # 查看应用日志
   docker-compose logs app
   
   # 检查环境变量
   docker-compose exec app env
   ```

3. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :3000
   lsof -i :3306
   
   # 修改 docker-compose.yml 中的端口映射
   ```

### 清理和重置

```bash
# 停止并删除所有容器
docker-compose down

# 删除所有数据（谨慎操作）
docker-compose down -v

# 清理未使用的镜像
docker image prune

# 完全重置
docker-compose down -v --rmi all
docker system prune -a
```

## 监控和日志

### 健康检查

```bash
# 检查所有服务健康状态
docker-compose ps

# 手动健康检查
curl -f http://localhost:3000/api/health
```

### 日志管理

```bash
# 查看最近的日志
docker-compose logs --tail=100 app

# 按时间过滤日志
docker-compose logs --since="2024-01-01T00:00:00" app

# 导出日志
docker-compose logs app > app.log
```

## 更新和维护

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build app

# 重启应用
docker-compose up -d app
```

### 数据库迁移

```bash
# 执行新的迁移
docker-compose exec app npx prisma migrate deploy

# 重新生成客户端
docker-compose exec app npx prisma generate
```

## 支持

如果遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查项目的 GitHub Issues
3. 提交新的 Issue 并附上详细的错误信息和日志

---

**注意**: 本部署方案适用于开发和测试环境。生产环境部署请根据实际需求进行安全加固和性能优化。