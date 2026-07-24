# AI伴播产品原型

AI伴播面向服饰、美妆、宠物等内容电商直播团队，用于制作商品展示和互动视频，并在直播中按商品讲解、主播口令或评论触发播放。

帮助运营团队补足主播无法完整展示多款色和细节、视频制作准备周期长、直播互动内容依赖人工切换的问题。

## 在线预览

- [AI伴播管理后台](https://yechangmian.github.io/ai-banbo-admin-prototype/)
- [直播中控台插件](https://yechangmian.github.io/ai-banbo-admin-prototype/live-console/)

## 本地运行

在项目目录启动静态文件服务：

```bash
python3 -m http.server 8128
```

打开以下页面：

- 管理后台：`http://127.0.0.1:8128/index.html`
- 直播中控插件：`http://127.0.0.1:8128/live-console/index.html`

## 原型说明

- `index.html`：AI伴播管理后台原型
- `index-v3.html`：V3 简化版原型源文件
- `live-console/`：直播中控台浏览器插件原型
- `assets/`：商品与数字模特案例素材
- `PRD.md`：产品需求文档

当前为静态交互原型，不包含真实后端接口、抖音开放平台回调和 AI 视频生成服务。详细产品规则见 `PRD.md`。
