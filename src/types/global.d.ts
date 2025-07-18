// Global Zendesk widget type declarations

import Swal from 'sweetalert2';
declare global {
  interface Window { Swal: typeof Swal }
}

import type { ToastInterface } from 'vue-toast-notification';
declare global {
  interface Window {
    $toast: ToastInterface;
  }
}

declare global {
  interface Window {
    zE: any;
    showZen: (userName?: string, userEmail?: string) => void;
    hideZen: () => void;
    openZen: () => void;
    zESettings: {
      webWidget: {
        position: { horizontal: string };
        offset: { horizontal: string; vertical: string };
      };
    };
  }
}

export {}; 