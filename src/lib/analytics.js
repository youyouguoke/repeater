// Plausible Analytics 自定义事件追踪
// 安全调用：如果 Plausible 未加载，静默跳过

/**
 * 追踪自定义事件
 * @param {string} eventName - 事件名称（使用小写+下划线）
 * @param {Object} props - 可选的事件属性
 */
export function trackEvent(eventName, props = {}) {
  if (typeof window === 'undefined') return;
  if (window.plausible) {
    window.plausible(eventName, { props });
  }
}

/**
 * 追踪页面浏览（用于 SPA 路由切换）
 */
export function trackPageview() {
  if (typeof window === 'undefined') return;
  if (window.plausible) {
    window.plausible('pageview');
  }
}

// 预定义的事件名称常量
export const EVENTS = {
  FILE_UPLOAD: 'file_upload',
  PLAY_CLICK: 'play_click',
  PAUSE_CLICK: 'pause_click',
  LOOP_SET_START: 'loop_set_start',
  LOOP_SET_END: 'loop_set_end',
  LOOP_RESET: 'loop_reset',
  SPEED_CHANGE: 'speed_change',
  LOOP_COUNT_CHANGE: 'loop_count_change',
  FAQ_TOGGLE: 'faq_toggle',
  NAV_CLICK: 'nav_click',
  FILE_DROP: 'file_drop',
  REPLAY_SEGMENT: 'replay_segment',
};
