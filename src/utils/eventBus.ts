type EventCallback = (data?: any) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  once(event: string, callback: EventCallback) {
    const onceCallback = (data?: any) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  clear() {
    this.events = {};
  }
}

export const eventBus = new EventBus();

// WhatsApp specific events
export const WHATSAPP_EVENTS = {
  TEMPLATE_PAGE_CHANGED: 'whatsapp:template:page-changed',
  TEMPLATE_LOADED: 'whatsapp:template:loaded',
  TEMPLATE_CREATED: 'whatsapp:template:created',
  TEMPLATE_DELETED: 'whatsapp:template:deleted',
  BROADCAST_SENT: 'whatsapp:broadcast:sent',
  CONFIGURATION_CHANGED: 'whatsapp:configuration:changed',
  TAB_CHANGED: 'whatsapp:tab:changed'
} as const;
