# NestJS Padlocal

基于NestJS的Padlocal客户端。

## 制作这个库的初衷

- 生产级别的云原生部署
  - 通过Prisma灵活对接各种数据库（SQLite、MySQL、PostgreSQL、MongoDB）
  - 基于Redis的缓存和消息队列
  - 兼容S3（AWS、腾讯云）的对象存储（可以通过minio本地部署或者对接阿里云）
- 更简单的使用和扩展
  - 直接使用BullMQ对接消息队列
  - 基于CQRS架构做二次开发
  - （TODO）对接[OneBot](https://onebot.dev)标准
  - Web UI

## 安装
```shell
# TODO: docker-compose

# 依赖
yarn

# 创建数据库
cd packages/db
yarn prisma migrate dev

# 构建
cd ../..
yarn build

# 开始
yarn dev
# UI - 3000端口
# 服务器 - 3001端口
```

## 功能规划

- [ ] 支持Padlocal全部消息类型

## Reference

以下的库给予了我启发：

- [padlocal-client-ts](https://github.com/padlocal/padlocal-client-ts)
- [Wechaty](https://github.com/wechaty/wechaty)