# API 草案

## GET /api/health

健康检查。

## POST /api/auth/mock-login

演示登录，返回 Sa-Token token 信息。

## GET /api/home/overview

首页概览假数据，包含用户、Token、会员、金融、任务、红点日志和模块入口。

第一版接口先返回内存假数据，等页面和字段稳定后再落 MySQL 表。

## 基础设施约定

MySQL 和 Redis 部署在同一台服务器时，后端统一使用 `INFRA_HOST` 作为默认主机。

- MySQL：`MYSQL_URL` 可完整覆盖；未配置时使用 `INFRA_HOST:3306`
- Redis：`REDIS_HOST` 可单独覆盖；未配置时使用 `INFRA_HOST:6379`
