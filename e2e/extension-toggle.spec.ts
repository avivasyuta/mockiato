import { expect, Page, test } from '@playwright/test';

interface MockiatoMessage {
  extensionName: string;
  type: string;
  message: {
    messageId: string;
    [key: string]: unknown;
  };
}

declare global {
  interface Window {
    receivedEvents: MockiatoMessage[];
  }
}

const setupPage = async (page: Page) => {
  await page.goto('/e2e/test-page.html');
  await page.waitForLoadState('networkidle');

  // Record every message posted by the interceptor and auto-respond to
  // 'requestIntercepted' events so requests don't hang waiting for a mock decision.
  await page.evaluate(() => {
    // In the real extension this node is created by the content script on
    // DOMContentLoaded; the settingsChanged handler requires it to be present.
    const statusNode = document.createElement('div');
    statusNode.id = 'mockiato-status';
    document.body.appendChild(statusNode);

    window.receivedEvents = [];

    window.addEventListener('message', (event) => {
      const data = event.data as MockiatoMessage;
      window.receivedEvents.push(data);

      if (data?.extensionName === 'Mockiato' && data?.type === 'requestIntercepted') {
        window.postMessage(
          {
            message: { messageId: data.message.messageId, headers: {} },
            type: 'requestChecked',
            extensionName: 'Mockiato',
          },
          '*',
        );
      }
    });
  });
};

const getInterceptedCount = (page: Page) =>
  page.evaluate(() => window.receivedEvents.filter((event) => event.type === 'requestIntercepted').length);

const setExtensionEnabled = async (page: Page, isEnabled: boolean) => {
  await page.evaluate((enabled) => {
    window.postMessage(
      {
        message: {
          showNotifications: true,
          showActiveStatus: true,
          enabledHosts: { [window.location.host]: enabled },
          showMobileNavBar: false,
          commentDisplayMode: 'tooltip',
          displayHttpMethodInline: false,
        },
        type: 'settingsChanged',
        extensionName: 'Mockiato',
      },
      '*',
    );
  }, isEnabled);
  await page.waitForTimeout(200);
};

test.describe('Extension toggle', () => {
  test('Interceptor captures requests while the extension is enabled', async ({ page }) => {
    await setupPage(page);

    // The test page loads with the interceptor already enabled.
    await page.click('#test-fetch');
    await page.waitForTimeout(1000);

    expect(await getInterceptedCount(page)).toBe(1);
  });

  test('Interceptor stops capturing requests when the extension is disabled', async ({ page }) => {
    await setupPage(page);

    // Disable the extension for this host, as the popup would on toggle-off.
    await setExtensionEnabled(page, false);

    await page.click('#test-fetch');
    await page.waitForTimeout(1000);

    expect(await getInterceptedCount(page)).toBe(0);
  });
});
