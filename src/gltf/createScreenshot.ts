import { performance } from 'perf_hooks';
import puppeteer from 'puppeteer';

const WIDTH = 350;
const HEIGHT = 350;
const DEVICE_PIXEL_RATIO = 1.0;

const timeDelta = (start: number, end: number) => {
  return ((end - start) / 1000).toPrecision(3);
};

const htmlTemplate = (modelURL: string) => {
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale="${DEVICE_PIXEL_RATIO}">
        <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
        <style>
          body {
            margin: 0;
          }
          model-viewer {
            --progress-bar-color: transparent;
            width: ${WIDTH};
            height: ${HEIGHT};
          }
        </style>
      </head>
      <body>
        <model-viewer
          background-color=""
          camera-orbit="-30deg 75deg 105%"
          environment-image="neutral"
          exposure="1.0"
          id="gltf-viewer"
          interaction-prompt="none"
          seamless-poster
          shadow-intensity="1.0"
          shadow-softness="1"
          src="${modelURL}"
          style="background-color: #ffffff;"
        />
      </body>
    </html>
  `;
};

export async function createScreenshot(
  modelURL: string,
  outputPath: string,
): Promise<void> {
  const browserT0 = performance.now();

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: DEVICE_PIXEL_RATIO,
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

  await page.setContent(htmlTemplate(modelURL), {
    waitUntil: 'domcontentloaded',
  });

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

      const modelViewer = document.getElementById('gltf-viewer');
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
