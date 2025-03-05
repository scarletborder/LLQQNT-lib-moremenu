import { Lognts } from './lognts';
import { OTHER_MENU_CLASSES, MORE_MENU_CLASS } from '../constants';

const logger = new Lognts('menu_manager');

interface MenuItem {
  /** svg风格的icon, 也可以使用网络路径
   * <svg viewBox="0 0 24 24">
          <use xlink:href="/_upper_/resource/icons/nav_skin_normal_24.svg#nav_skin_normal_24"></use>
      </svg>
   */
  icon: string;

  /**
   * 需要显示的按钮title
   */
  title: string;

  /**
   * 点击回调, 不接受任何参数
   */
  callback: Function;
}

// const _MoreMenuAPI = window.lib_moremenu;

class _MoreMenuManager {
  // 控制
  private waitGroup = 0;

  // 数据
  private _menuItems: Map<string, Array<MenuItem>> = new Map();

  // api
  private static _MoreMenuAPI = null;


  /**
     *  渲染进程执行,初始化静态 document 对象
     * 
     * 
    !!!用户请不要调用,这是给lib库执行的
     * @param doc 
     */
  public async initialize() {
    _MoreMenuManager._MoreMenuAPI = window.lib_moremenu;
    if (!_MoreMenuManager._MoreMenuAPI) {
      throw new Error('MoreMenuAPI not found, Ensure it has extracted to window in preload.js?');
    }
    this.waitGroup = await _MoreMenuManager.getInitialWaitGroup();
    logger.log(`MoreMenuManager initialized. Initial waitGroup: ${this.waitGroup}`);
  }

  // 从主进程获取初始 waitGroup 值
  static async getInitialWaitGroup(): Promise<number> {
    if (!_MoreMenuManager._MoreMenuAPI) {
      throw new Error('MoreMenuAPI not found, Ensure it has extracted to window in preload.js?');
    }
    try {
      const waitGroup = await _MoreMenuManager._MoreMenuAPI.getWaitGroup();
      return waitGroup;
    } catch (error) {
      console.error('Failed to get waitGroup from main process:', error);
      throw error;
    }
  }

  /**
     * 添加一个菜单项
     * @param icon 
     * @param title 
     * @param callback 
     * @param sign 用户的插件名字,区分不同插件使用,请尽量使用唯一的名字
     */
  public AddItem(icon: string, title: string, callback: Function, sign: string): void {
    if (!this._menuItems.has(sign)) {
      this._menuItems.set(sign, []);
    }
    this._menuItems.get(sign)!.push({ icon: icon, title: title, callback: callback });
  }


  /**
     * 用户结束自己的所有AddItem()操作后调用
     */
  public Done(): void {
    if (this.waitGroup > 0) {
      this.waitGroup -= 1;
    }

    if (this.waitGroup === 0) {
      console.log('Done');
      this.__StartHook();
    }
  }


  /**
     *    /// start hook
       /// !!!用户请不要调用,这是给lib库执行的
     */
  public __StartHook(): void {
    this.waitGroup = 0;

    if (!document.querySelector(`style.${MORE_MENU_CLASS}`)) {
      // 注入style
      const moremenuStyle = document.createElement('style');
      moremenuStyle.innerHTML = `
        .${MORE_MENU_CLASS} {
          top: unset !important;
          bottom: 1vh;
          overflow-y: auto;
          max-height: 50vh;
        }
      `;
      document.head.appendChild(moremenuStyle);
    }

    new MutationObserver((mutations) => {
      // 首先判断是否有要注入的菜单
      // body > div.q-context-menu.q-context-menu__mixed-type.more-menu
      // 这个selector在240729验证过,另外在linux的latest版本(2025/3/5)也验证过
      const hisMoreMenu = document.querySelector('.q-context-menu.more-menu.q-context-menu__mixed-type');
      if (!hisMoreMenu || !(hisMoreMenu instanceof HTMLElement)) {
        return;    // more menu不会去创建子菜单
      }
      if (hisMoreMenu.classList.contains(MORE_MENU_CLASS)) {
        return; // 已经修改过了
      }
      try { // 消除别人的右键菜单标记,因为他没有用到这个菜单
        hisMoreMenu.classList.remove(...OTHER_MENU_CLASSES);
      } finally { }


      hisMoreMenu.classList.add(MORE_MENU_CLASS);

      // 添加我们自己的
      this._menuItems.forEach((items, sign) => {
        // 为所有注册的插件添加菜单项
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          this.__hook_one_item(item, hisMoreMenu);
        }
      });

    }).observe(document.body, {
      childList: true,
    });
  }

  private __hook_one_item(item: MenuItem, menu: Element): void {
    const newLink = createMoreMenuItem(item);
    if (item.callback) {
      // TODO: 预留,为之后实现子菜单做准备
      newLink.addEventListener('click', () => {
        item.callback();
        menu.remove(); // 关闭菜单
      });
    }
    menu.appendChild(newLink);
  }
}

/**
 * 添加一个普通的moremenu菜单项(不具备sub_menu功能)
 * @param item 
 * @returns 
 */
function createMoreMenuItem(item: MenuItem): Node {
  // inner html template
  const template = (icon: string, title: string) =>
    `<div class="q-context-menu-item__icon q-context-menu-item__head">
            <i class="q-svg-icon q-icon vue-component" style="width: 16px; height: 16px; ">${icon}</i>
        </div><!----><span class="q-context-menu-item__text"><span>${title}</span></span><!---->`;

  const newLink = document.createElement('a');
  newLink.className = 'q-context-menu-item q-context-menu-item--normal vue-component';
  newLink.setAttribute('tabindex', '-1');
  newLink.setAttribute('bf-menu-item', '');
  newLink.setAttribute('role', 'menuitem');
  newLink.setAttribute('bf-label-inner', 'true');
  newLink.id = 'newUniqueId'; // 确保 ID 唯一

  newLink.innerHTML = template(item.icon, item.title);

  return newLink;
}



export const MoreMenuManager = new _MoreMenuManager();
