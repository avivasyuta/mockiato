import { expect, test } from '@playwright/test';

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

test.describe('Pub Sub', () => {
  test('Interceptor post event to extension context and receive response back', async ({ page }) => {
    // Navigate to our test page
    await page.goto('/e2e/test-page.html');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Set up message listener in the browser context and collect events
    await page.evaluate(() => {
      window.receivedEvents = [];

      window.addEventListener('message', (event) => {
        window.receivedEvents.push(event.data as MockiatoMessage);
      });
    });

    // Make a test request
    await page.click('#test-fetch');

    // Wait for any events to be received
    await page.waitForTimeout(1000);

    // Emulate response from extension context
    await page.evaluate(() => {
      const receivedEvents = window.receivedEvents ?? [];

      if (receivedEvents.length === 0) {
        throw new Error('No events received from extension. Extension is not working.');
      }

      const { messageId } = receivedEvents[0].message;

      window.postMessage(
        {
          message: {
            messageId,
            headers: {},
          },
          type: 'requestChecked',
          extensionName: 'Mockiato',
        },
        '*',
      );
    });

    // Retrieve all event data from the browser context
    const receivedEvents = await page.evaluate(() => {
      return window.receivedEvents ?? [];
    });

    // Verify that network requests were intercepted
    expect(receivedEvents.length).toEqual(2);
    expect(receivedEvents[0]).toEqual({
      extensionName: 'Mockiato',
      message: {
        messageId: expect.any(String),
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        method: 'GET',
      },
      type: 'requestIntercepted',
    });
    expect(receivedEvents[1]).toEqual({
      extensionName: 'Mockiato',
      message: {
        messageId: expect.any(String),
        headers: {},
      },
      type: 'requestChecked',
    });
  });
});
