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
          .logo {
            position: fixed;
            bottom: 0;
            right: 0;
            height: 36px;
            padding: 2px 4px;
            background: rgba(0, 0, 0, 0.3);
          }
        </style>
      </head>
      <body>
        <model-viewer
          background-color=""
          camera-orbit="-30deg 75deg 30m"
          camera-target="0 auto 0"
          field-of-view="1deg"
          max-camera-orbit="Infinity 157.5deg 200m"	
          environment-image="neutral"
          exposure="0.9"
          id="gltf-viewer"
          interaction-prompt="none"
          seamless-poster
          shadow-intensity="0.8"
          shadow-softness="0.5"
          src="${modelURL}"
          style="background-color: #3F3F3F;"
        />
        <img class="logo" src="data:image/png;base64,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" />
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
                setTimeout(() => {
                  resolve();
                }, 500);
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
