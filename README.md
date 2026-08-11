# Imagine-1MB

[![build](https://travis-ci.org/YOGEMOW/Imagine-1MB.svg?branch=master)](https://travis-ci.org/YOGEMOW/Imagine-1MB)

Imagine-1MB is a desktop app for compression of PNG, JPEG and WebP, with a modern and friendly UI.

Save for web.

## Install

For Windows, macOS and Linux, download binaries from:

[https://github.com/YOGEMOW/Imagine-1MB/releases](https://github.com/YOGEMOW/Imagine-1MB/releases)

 - `Imagine-1MB-Setup-x.y.z.exe`  - *Windows*
 - `Imagine-1MB-x.y.z.dmg`        - *macOS*
 - `Imagine-1MB-x.y.z.AppImage`   - *Linux*

国内用户从 GitHub 下载可能比较慢，可以使用[国内加速](https://github.com/YOGEMOW/Imagine-1MB/issues)

### Install on linux

App for linux is distributed in [AppImage](http://appimage.org/) format.
Install it with command line:

```bash
chmod a+x Imagine-1MB-x.y.z-x86_64.AppImage # make executable
./Imagine-1MB-x.y.z-x86_64.AppImage # install and run
```

## Screenshot

![Screenshot](./screenshots/shot.jpg)

## Features

 - Multi format (JPEG, PNG, WebP)
 - Format conversion
 - Cross platform
 - GUI
 - Batch optimization
 - i18n (English, 简体中文, Nederlands, Español, Français, Italiano, Deutsch)

## Build and Contribute

```bash
git clone https://github.com/YOGEMOW/Imagine-1MB.git
npm install
npm run dev
```

A PR with **all checks passed** is welcome.

Before submit a PR, please run `npm run test` and make sure it success on your machine.

Up to now, there are only [5 locales](https://github.com/YOGEMOW/Imagine-1MB/tree/master/modules/locales). To add a new locale, you can either submit a PR, or [create an issue](https://github.com/YOGEMOW/Imagine-1MB/issues/new).

## Built on

 - [pngquant](https://pngquant.org/): Lossy PNG compressor
 - [mozjpeg](https://github.com/mozilla/mozjpeg): Improved JPEG encoder
 - [WebP](https://developers.google.com/speed/webp/): A new image format for the Web
 - [Electron](https://electron.atom.io/): Build cross platform desktop apps with JavaScript, HTML, and CSS
