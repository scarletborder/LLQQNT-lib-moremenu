# LiteLoaderQQNT-ForceExit

由于GNOME桌面下的QQNT频繁出现无法通过右键任务栏图标关闭QQ进程,而每次通过系统管理器去杀进程又太烦,因此写本插件,为QQNT的主窗口增加一个关闭QQ进程的快捷方式.



## 如果你想...

* 在编写插件时使用 `npm` / `yarn` 等包管理器；
* 被 `Webpack` 的打包速度困扰已久
* 希望使用 `TypeScript` 编写插件脚本
* 想使用 `ESLint` 纠正代码错误和统一格式
* 执行一行命令即可完成代码检查、代码打包和输出 `zip` 文件

那么这个模板正好适合你！

## 使用

1. 点击本仓库页面右上角的 `Use this template`，然后选择 `Create a new repository`
2. 在接下来的页面中填写你的仓库信息后，点击 `Create repository`
3. 将创建的仓库克隆至本地，然后编辑 [`manifest.json`](manifest.json) （[文档](https://liteloaderqqnt.github.io/docs/introduction.html#%E6%89%8B%E5%8A%A8%E5%88%9B%E5%BB%BA)）
4. （可选）编辑 [TypeScript 配置文件](tsconfig.json)、[Vite 配置文件](electron.vite.config.ts) 和 [ESLint 配置文件](.eslintrc.js)，让项目配置风格更符合你的口味
5. 运行 `npm install` 安装依赖包，你也可以随意安装其他需要的依赖包
6. 开始编写代码
7. 执行 `npm run lint` 检查代码
8. 执行 `npm run build` 打包代码并输出 `zip` 文件
9. 安装体验或是将成果分享给你的朋友吧！

## 常见问题

### 部分模块打包后功能不正常或不起作用

请遵循 [Rollup 文档](https://rollupjs.org/configuration-options/#external) 将运行不正常的模块添加至 Vite 的 `rollupOptions` 中，然后利用 `vite-plugin-cp` 插件将对应模块复制到 `dist/node_modules` 目录中。

## 鸣谢

本插件修改自 [LiteLoaderQQNT](https://github.com/LiteLoaderQQNT/LiteLoaderQQNT) 插件模板。
