// Global Zendesk widget type declarations
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