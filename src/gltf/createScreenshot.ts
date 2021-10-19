import { performance } from 'perf_hooks';
import puppeteer from 'puppeteer';

const timeDelta = (start: number, end: number) => {
  return ((end - start) / 1000).toPrecision(3);
};

export async function createScreenshot(
  modelURL: string,
  outputPath: string,
): Promise<void> {
  const browserT0 = performance.now();

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    defaultViewport: {
      width: 600,
      height: 600,
    },
    headless: true,
  });

  const page = await browser.newPage();

  page.on('error', (error) => {
    console.log(`🚨 ${error}`);
  });

  page.on('console', async (message) => {
    const args = await Promise.all(
      message.args().map((arg) => arg.jsonValue()),
    );

    if (args.length) {
      console.log(`➡️`, ...args);
    }
  });

  const browserT1 = performance.now();

  console.log(`🚀 Launched browser (${timeDelta(browserT0, browserT1)}s)`);

  const contentT0 = performance.now();

  await page.goto('https://modelviewer.dev/');

  const contentT1 = performance.now();

  console.log(
    `🗺  Loading template to DOMContentLoaded (${timeDelta(
      contentT0,
      contentT1,
    )}s)`,
  );

  const renderT0 = performance.now();

  const evaluateError = await page.evaluate(async (maxTimeInSec) => {
    const modelBecomesReady = new Promise<void>((resolve, reject) => {
      let timeout: NodeJS.Timeout;
      if (maxTimeInSec > 0) {
        timeout = setTimeout(() => {
          reject(
            new Error(
              `Stop capturing screenshot after ${maxTimeInSec} seconds`,
            ),
          );
        }, maxTimeInSec * 1000);
      }

      const modelViewer = document.getElementsByTagName('model-viewer')[0];
      if (!modelViewer) {
        reject(new Error('Missing model-viewer'));
        return;
      }
      modelViewer.addEventListener(
        'poster-dismissed',
        () => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (maxTimeInSec > 0) {
                  clearTimeout(timeout);
                }
                resolve();
              });
            });
          });
        },
        { once: true },
      );
    });

    try {
      await modelBecomesReady;
      return null;
    } catch (error) {
      return (error as Error).message;
    }
  }, 30);

  const renderT1 = performance.now();
  console.log(
    `🖌  Rendering screenshot of model (${timeDelta(renderT0, renderT1)}s)`,
  );

  if (evaluateError) {
    console.log(evaluateError);
    await browser.close();
    throw new Error(evaluateError);
  }

  const screenshotT0 = performance.now();

  await page.screenshot({
    type: 'png',
    path: outputPath,
    omitBackground: true,
  });

  const screenshotT1 = performance.now();

  console.log(
    `🖼  Captured screenshot (${timeDelta(screenshotT0, screenshotT1)}s)`,
  );

  await browser.close();
}
