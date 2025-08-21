let zendeskLoaded = false;

function loadZendesk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (zendeskLoaded && (window as any).zE) {
      return resolve();
    }

    (window as any).zESettings = {
      webWidget: {
        position: { horizontal: 'left' },
        offset: { horizontal: '70px', vertical: '15px' }
      }
    };

    const script = document.createElement('script');
    script.id = 'ze-snippet';
    script.src =
      'https://static.zdassets.com/ekr/snippet.js?key=91ab9e64-789b-4947-80f6-f2a9712a23b0';
    script.async = true;

    script.onload = () => {
      zendeskLoaded = true;
      // Resolve only when zE is fully ready
      (window as any).zE(() => {
        (window as any).zE.hide();
        resolve();
      });
    };

    script.onerror = () => reject(new Error('Failed to load Zendesk widget'));
    document.body.appendChild(script);
  });
}

export async function showZen(userName = '', userEmail = ''): Promise<void> {
  await loadZendesk();

  (window as any).zE(() => {
    (window as any).zE.activate();

    if (userName || userEmail) {
      (window as any).zE('webWidget', 'prefill', {
        name: { value: userName, readOnly: !!userName },
        email: { value: userEmail, readOnly: !!userEmail }
      });
    }
  });
}

export function hideZen(): void {
  if ((window as any).zE) {
    (window as any).zE(() => (window as any).zE.hide());
  }
}
