// 定义事件处理函数的类型
type EventHandler<T = any> = (value: T, event: Event) => Promise<void> | void;
// 定义通用事件监听器的类型
type ListenerHandler = (event: Event) => Promise<void> | void;

/**
 * 静态工具类，用于简化 DOM 事件监听和元素操作
 * 
 * 在渲染进程的 JavaScript 文件中引入并初始化
 * ```ts
 * import { DOMEventUtils } from './DOMEventUtils';

// 在渲染进程中初始化
DOMEventUtils.initialize(document);

// 示例：监听某个输入框的变化
DOMEventUtils.onValueChange('scb-key-input', async (value) => {
  console.log('Key changed to:', value);
  // 通过 IPC 通知主进程更新配置
  window.ipcRenderer.send('update-config', { encryptionKey: value });
});
```
 * 
 */
export class DOMEventUtils {
  // 静态 document 对象，全局引用
  private static document: Document | null = null;

  /**
     * 初始化静态 document 对象
     * @param doc Document 对象
     * @throws 如果尝试重复初始化，将抛出错误
     */
  static initialize(doc: Document): void {
    if (!this.document && doc) {
      this.document = doc;
    } else if (this.document) {
      throw new Error('Document already initialized.');
    }
  }

  /**
     * 创建一个 hook 函数，用于获取指定元素的值
     * @param selectorId 元素的选择器 ID（不含 #）
     * @param getValueFn 可选的自定义取值函数，接收 document 并返回 value
     * @returns 返回一个异步函数，每次调用获取当前值
     */
  static createHook(
    selectorId: string,
    getValueFn: ((doc: Document) => any) | null = null
  ): () => Promise<any> {
    return async () => {
      if (!this.document) {
        throw new Error('Document not initialized. Call initialize() first.');
      }
      const element = this.document.querySelector(`#${selectorId}`);
      if (!element) return null;

      if (getValueFn) {
        return getValueFn(this.document);
      }
      // 默认返回值：input 的 value 或元素的 innerText
      return (element as HTMLInputElement).value || element.textContent || null;
    };
  }

  /**     
     * 添加事件监听器到指定元素
     * @param selectorId 元素的选择器 ID
     * @param eventType 事件类型（如 'click', 'change'）
     * @param handler 事件处理函数
     * @param options 事件监听选项（如 { once: true }）
     * @returns 返回移除监听器的方法
     */
  static addEventListener(
    selectorId: string,
    eventType: string,
    handler: ListenerHandler,
    options: AddEventListenerOptions = {}
  ): (() => void) | null {
    if (!this.document) {
      throw new Error('Document not initialized. Call initialize() first.');
    }
    const element = this.document.querySelector(`#${selectorId}`);
    if (!element) return null;

    const listener = async (event: Event) => {
      await handler(event);
    };
    element.addEventListener(eventType, listener, options);
    return () => element.removeEventListener(eventType, listener, options);
  }

  /**
     * 监听元素值变化事件
     * @param selectorId 元素的选择器 ID
     * @param handler 处理函数，接收新值和事件对象
     * @param options 事件监听选项
     * @returns 返回移除监听器的方法
     */
  static onValueChange(
    selectorId: string,
    handler: EventHandler<string>,
    options: AddEventListenerOptions = {}
  ): (() => void) | null {
    return this.addEventListener(selectorId, 'change', async (event: Event) => {
      const value = (event.target as HTMLInputElement).value;
      await handler(value, event);
    }, options);
  }

  /**
     * 监听点击事件
     * @param selectorId 元素的选择器 ID
     * @param handler 处理函数，接收事件对象
     * @param options 事件监听选项
     * @returns 返回移除监听器的方法
     */
  static onClick(
    selectorId: string,
    handler: ListenerHandler,
    options: AddEventListenerOptions = {}
  ): (() => void) | null {
    return this.addEventListener(selectorId, 'click', async (event: Event) => {
      await handler(event);
    }, options);
  }

  /**
     * 监听开关状态改变的点击事件
     * @param selectorId 元素的选择器 ID
     * @param handler 处理函数，接收新的开关状态和事件对象
     * @param options 事件监听选项
     * @returns 返回移除监听器的方法
     */
  static onToggle(
    selectorId: string,
    handler: EventHandler<boolean>,
    options: AddEventListenerOptions = {}
  ): (() => void) | null {
    return this.addEventListener(selectorId, 'click', async (event: Event) => {
      const element = event.target as HTMLElement;
      const isActive = element.classList.contains('is-active');
      element.classList.toggle('is-active');
      await handler(!isActive, event);
    }, options);
  }

  /**
     * 创建带有值的 DOM 元素
     * 
     * 请注意要将返回的元素添加到 document 中
     * @param selectorId 元素的 ID
     * @param type 元素类型（'input' 或 'div'）
     * @param initialValue 初始值
     * @returns 创建的 DOM 元素
     */
  static createValueElement(
    selectorId: string,
    type: 'input' | 'div' = 'input',
    initialValue: string = ''
  ): HTMLElement {
    if (!this.document) {
      throw new Error('Document not initialized. Call initialize() first.');
    }

    const element = this.document.createElement(type === 'input' ? 'input' : 'div');
    element.id = selectorId;

    if (type === 'input') {
      (element as HTMLInputElement).type = 'text';
      (element as HTMLInputElement).value = initialValue;
    } else {
      element.innerText = initialValue;
    }

    return element;
  }

  /**
     * 检查元素是否在 document 中存在
     * @param selectorId 元素的选择器 ID
     * @returns 是否存在
     */
  static exists(selectorId: string): boolean {
    if (!this.document) return false;
    return !!this.document.querySelector(`#${selectorId}`);
  }
}

// 使用示例
/*
class ChatListeners {
    constructor(doc: Document) {
        DOMEventUtils.initialize(doc);
    }

    async setupListeners() {
        const globalAPI = window.scb_global;

        // 创建 hooks
        const useKeyValue = DOMEventUtils.createHook('scb-key-input');
        const useColorValue = DOMEventUtils.createHook('scb-color-selector');

        // 设置监听器
        DOMEventUtils.onValueChange('scb-key-input', async (value) => {
            await globalAPI.setConfig({ encryptionKey: value });
        });

        DOMEventUtils.onToggle('scb-tag-button', async (isActive) => {
            await globalAPI.setConfig({ isUseTag: isActive });
        });

        // 创建新元素并添加监听
        const newInput = DOMEventUtils.createValueElement('new-setting', 'input', 'default');
        document.body.appendChild(newInput);
        DOMEventUtils.onValueChange('new-setting', async (value) => {
            console.log('New value:', value);
        });
    }
}
*/

// github.com/scarletborder