const _listeners = new Map();

export const EventBus = {
  on(event, cb) {
    if (!_listeners.has(event)) _listeners.set(event, []);
    _listeners.get(event).push(cb);
    return () => this.off(event, cb);
  },
  off(event, cb) {
    const list = _listeners.get(event);
    if (list) _listeners.set(event, list.filter(l => l !== cb));
  },
  emit(event, data = {}) {
    (_listeners.get(event) ?? []).slice().forEach(cb => cb(data));
  },
};
