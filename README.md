# Imagine-1MB

Imagine-1MB 是一款基于 Electron 的图片压缩桌面应用，支持 PNG、JPEG、WebP 三种格式，界面简洁、操作直观，适合日常批量压缩图片。

## 功能特性

- 支持 PNG、JPEG、WebP 压缩与格式互转；
- “压缩模式”可将**图片质量**与**图片大小**分开设置，互不干扰；
- 支持无损压缩（PNG / JPEG / WebP）；
- 支持保留或剥离 EXIF、ICC、XMP 等元数据；
- 支持批量处理、拖拽添加图片；
- 支持多语言界面（英文、简体中文等）；
- 安装版内置卸载程序（红色图标），可从“设置 → 应用”正常卸载。

## 下载与安装

最新版本请前往 [GitHub Releases](https://github.com/YOGEMOW/Imagine-1MB/releases) 下载。

- `Imagine-1MB-0.7.8.exe`：便携版，无需安装，解压后直接运行；
- `Imagine-1MB-Setup-0.7.8.exe`：Windows 安装版；
- macOS / Linux 版本：请在 Releases 页面选择对应平台安装包。

国内用户从 GitHub 下载较慢时，可以使用 [GitHub 加速](https://github.com/YOGEMOW/Imagine-1MB/issues)。

## 支持平台

- Windows x64
- macOS x64 / arm64
- Linux x64

## 截图

![Screenshot](./screenshots/shot.jpg)

## 开发与构建

```bash
git clone https://github.com/YOGEMOW/Imagine-1MB.git
npm install
npm run dev
```

提交代码前请确保测试通过：

```bash
npm run test
```

构建生产版本：

```bash
npm run build
```

打包 Windows 便携版与安装版：

```bash
npx electron-builder --win
```

## 技术栈

- [pngquant](https://pngquant.org/)：PNG 有损压缩
- [optipng](http://optipng.sourceforge.net/)：PNG 无损压缩
- [mozjpeg](https://github.com/mozilla/mozjpeg)：JPEG 优化编码
- [jpegtran](https://jpegclub.org/jpegtran/)：JPEG 无损优化
- [WebP](https://developers.google.com/speed/webp/)：WebP 编码
- [Electron](https://electron.atom.io/)：跨平台桌面应用框架

## 许可证

本项目基于 ISC 许可证开源。
