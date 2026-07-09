/**
 * SmartBusbar v2.0 — localStorage 缓存工具
 *
 * 提供响应式的 localStorage 存储功能，支持：
 * - 版本控制（升级时自动清除旧数据）
 * - 自动保存（监听变化自动持久化）
 * - 防抖优化（避免频繁写入）
 *
 * @module useLocalStorage
 */

import { ref, watch, readonly } from "vue";

// 缓存配置
const STORAGE_VERSION = "2.0";

/**
 * localStorage 缓存工具
 *
 * @param {string} key - 存储键名
 * @param {object} defaultValue - 默认值
 * @param {object} options - 配置选项
 * @param {string} [options.version] - 缓存版本号
 * @param {boolean} [options.watchDeep=true] - 是否深度监听
 * @param {number} [options.debounce=300] - 防抖延迟(ms)
 * @returns {object} { data, save, clear, restore }
 *
 * @example
 * const { data, save, clear } = useLocalStorage('my_config', { name: 'default' })
 * console.log(data.value.name) // 读取
 * data.value.name = 'new' // 自动保存
 */
export function useLocalStorage(key, defaultValue, options = {}) {
  const {
    version = STORAGE_VERSION,
    watchDeep = true,
    debounce = 300,
  } = options;

  /**
   * 从 localStorage 读取数据
   * @returns {object|null} 解析后的数据或 null
   */
  function load() {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // 版本检查
      if (parsed._version !== version) {
        console.warn(
          `[useLocalStorage] 版本不匹配 (${parsed._version} !== ${version})，清除旧数据`,
        );
        clear();
        return null;
      }

      return parsed.data;
    } catch (e) {
      console.error("[useLocalStorage] 读取失败:", e);
      return null;
    }
  }

  /**
   * 保存数据到 localStorage
   * @param {object} data - 要保存的数据
   * @returns {boolean} 是否保存成功
   */
  function save(data) {
    try {
      const payload = {
        _version: version,
        _timestamp: Date.now(),
        data,
      };
      localStorage.setItem(key, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error("[useLocalStorage] 保存失败:", e);
      return false;
    }
  }

  /**
   * 清除缓存
   */
  function clear() {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("[useLocalStorage] 清除失败:", e);
    }
  }

  // 从缓存恢复或使用默认值
  const stored = load();
  const data = ref(
    stored !== null ? { ...defaultValue, ...stored } : defaultValue,
  );

  // 防抖保存
  let saveTimer = null;

  function debouncedSave(newVal) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      save(newVal);
      saveTimer = null;
    }, debounce);
  }

  // 监听变化自动保存
  watch(data, (newVal) => debouncedSave(newVal), {
    deep: watchDeep,
    immediate: false,
  });

  return {
    /** 响应式数据（只读） */
    data: readonly(data),
    /** 手动保存 */
    save: () => save(data.value),
    /** 清除缓存 */
    clear,
    /** 从 localStorage 恢复数据 */
    restore: () => {
      const loaded = load();
      if (loaded) {
        data.value = { ...defaultValue, ...loaded };
      }
    },
    /** 可写的响应式数据（内部使用） */
    _data: data,
  };
}

/**
 * 检查 localStorage 是否可用
 * @returns {boolean}
 */
export function isLocalStorageAvailable() {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

export default useLocalStorage;
