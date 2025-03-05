# LLQQNT-lib-moremenu

允许用户添加左下角的更多菜单选项


## 使用

使用本插件,主进程中只需要向register管理器注册自己的信息,通过`global`暴露的`MoreMenuRegister`在liteloaderQQNT指定的`onBrowserWindowCreated()`函数中完成这个步骤

```ts
// main/index.ts
export const onBrowserWindowCreated = (window: BrowserWindow) => {
  const MoreMenuRegister = global.MoreMenuRegister;
  MoreMenuRegister.registerPlugin('scb_forceQuit');
  return;
};
```

在渲染进程中通过`window`暴露的MoreMenu管理器添加自己的按钮,执待全部的按钮添加后执行`Done()`结束流程.

这里使用setInterval是为了确保liteloader加载用户插件时,`lib_moremenu`已经加载. 

> 尚未明确liteloader是否有办法指定每个插件的前置依赖.

```ts
// renderer/index.ts, 全局作用块中
const timer = setInterval(() => {
  const MoreMenuManager = window.MoreMenuManager;
  if (MoreMenuManager && MoreMenuManager != undefined) {
    MoreMenuManager.AddItem(svgIcon, 'Exit QQ', () => {
      forceAPI.quit(); // 用户插件定义的一个api
    }, 'scb_forceQuit');
    MoreMenuManager.Done();

    clearInterval(timer);
  }}, 500);

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-octagon" viewBox="0 0 16 16">
  <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>`;
```



## TODO list

- [ ] 主进程/渲染进程,waitGroup变量互斥性
- [ ] 对用户插件开发更加友善的增加`more_menu`选项流程
- [ ] 完善函数签名注释



## 理论和实现

一些隐藏的问题可能是由实现方法导致,这里列出来欢迎斧正

### 实现增加菜单选项`more_menu.ts`

通过`waitGroup`信号量大小的判断所有已注册插件已完成item的添加,开始执行菜单注入流程.

首先确保QQNT mainWindow包含增强过的更多菜单的style,他会确保菜单定位通过bottom而非原生的top.并允许上下滚动和限制最大高度(50vh)

使用`MutationObserver`监听DOM树变化.通过选择器`.q-context-menu.more-menu.q-context-menu__mixed-type`找到更多菜单.判断是否已经修改过,如无开始下列注入主要注入逻辑.

> 这里我参考了`LiteLoaderQQNT_lite_tools`的实现方式,但是那位作者为了寻找右键菜单,寻找右键菜单所使用的选择器是`.q-context-menu:not(.lite-toos-context-menu)`,但是这会导致左下角更多菜单展开时,发生DOM变化,而该更多菜单的类包含`.q-context-menu`,因此会被意料之外的注入.
>
> 这里我清除了那位作者带来的影响,使得两个插件可以兼容.
>
> 如果有其他插件带来了这种影响,请修改`src/constants.ts`的`OTHER_MENU_CLASSES`

对每个插件注册过的item,通过模板创建一个more_menu_item风格的Element,并为clieck事件添加用户需求的callback(以及关闭菜单),之后将他添加到menu中.

### 注册用户插件

主进程中,全局区域为本lib插件创建注册管理器实例,为global创建成员以方便所有用户插件的主进程进行调用.因此用户需要确保晚于本lib插件全局区域执行后再执行,而最好的解决方案就是在`onBrowserWindowCreated()`函数中执行.

渲染进程中,全局区域初始化菜单管理器实例,为window创建成员以方便所有用户插件的渲染进程进行调用.因此用户需要确保晚于本lib插件全局区域执行后再执行,这里目前的最佳实践是通过设置可清理定时器的方案.

## 鸣谢

本插件修改自 [LiteLoaderQQNT](https://github.com/LiteLoaderQQNT/LiteLoaderQQNT) 插件模板。
