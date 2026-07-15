# Chinese Codex

“中国人最爱做的万能软件”荒诞产品原型。

## 技术栈

- 前台：Vue 3 + Vite + TypeScript + Element Plus + Pinia + Vue Router + Axios + ECharts
- 后端：Spring Boot 3 + MyBatis-Plus + Sa-Token
- 数据库：MySQL
- 可选缓存：Redis 后续按需要接入

## 目录

```text
chinese-codex/
  frontend/   # 用户端 Web
  backend/    # API 服务
  docs/       # SQL 和接口说明
```

## 本地启动

```bash
pnpm install
pnpm dev:web
```

```bash
mvn -f backend/pom.xml spring-boot:run
```

后端默认端口：`8080`

前端开发服务会把 `/api` 代理到 `http://localhost:8080`。

## 环境变量

MySQL 和 Redis 默认使用同一台服务器，通过 `INFRA_HOST` 统一配置。

```bash
export INFRA_HOST=127.0.0.1
export MYSQL_USERNAME=root
export MYSQL_PASSWORD=
export REDIS_PASSWORD=
```

如需分别覆盖：

```bash
export MYSQL_URL='jdbc:mysql://127.0.0.1:3306/chinese_codex?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai'
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379
export REDIS_DATABASE=0
```
