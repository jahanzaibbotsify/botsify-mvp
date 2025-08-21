// Global Zendesk widget type declarations

import Swal from 'sweetalert2';
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
    Swal: typeof Swal
    $toast: ToastInterface;
    $confirm: (overrideOpt?: any, confirmCallback?: () => void, cancelCallback?: () => void) => void;
  }
}

export {}; 