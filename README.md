# 鲨醒 Shaxing

这是鲨醒 Windows 桌面轻备忘工具的官网与下载页仓库。

## 当前发布信息

- 当前版本：1.0.0
- 发布通道：stable
- 发布日期：2026-06-09
- 软件包文件名：`Shaxing-Portable.zip`
- 下载地址规则：`https://github.com/yyl1509452223-coder/shaxingnew/releases/latest/download/Shaxing-Portable.zip`

## 网站文件

- `index.html`：官网与下载页
- `styles.css`：页面样式
- `script.js`：页面动效
- `release.json`：客户端自动更新或下载页读取的版本元数据
- `.nojekyll`：GitHub Pages 静态托管配置

## 上线步骤

1. 打开仓库 Settings -> Pages。
2. Source 选择 `Deploy from a branch`。
3. Branch 选择 `main`，目录选择 `/root`，保存。
4. 等 GitHub Pages 构建完成后，官网通常会出现在 `https://yyl1509452223-coder.github.io/shaxingnew/`。
5. 在 Releases 创建版本 `v1.0.0`，上传 `Shaxing-Portable.zip`。

上传 Release 资产后，官网里的下载按钮会指向最新版软件包。
