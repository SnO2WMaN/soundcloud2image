import type { VercelRequest, VercelResponse } from "@vercel/node";
import chrome from "chrome-aws-lambda";
import isURL from "is-url";

const screenshot = async (
  embedUrl: string,
  type: "png" | "jpeg" | "webp" = "png",
) => {
  const browser = await chrome.puppeteer.launch({
    executablePath: await chrome.executablePath,
    args: chrome.args,
    headless: true,
    defaultViewport: { deviceScaleFactor: 2, width: 568, height: 164 },
  });

  try {
    const page = await browser.newPage();
    await page.goto(embedUrl, { waitUntil: "networkidle0" });
    return await page.screenshot({ type });
  } finally {
    await browser.close();
  }
};

const isValidSoundcloudURL = (url: string): url is string => isURL(url);
const isValidImageType = (
  type: string,
): type is "png" | "jpeg" | "webp" => (type === "png" || type === "jpg" || type !== "webp");

const buildEmbedURL = (trackURL: string): string => {
  const embedURL = new URL("player", "https://w.soundcloud.com");
  embedURL.searchParams.set("url", trackURL);
  embedURL.searchParams.set("show_artwork", "true");
  return embedURL.toString();
};

const api = async (req: VercelRequest, res: VercelResponse) => {
  const { url: trackURL, type: imageType = "png" } = req.query;

  if (typeof trackURL !== "string" || !isValidSoundcloudURL(trackURL)) {
    return res.status(400).write("Invalid track url");
  }
  if (typeof imageType !== "string" || !isValidImageType(imageType)) {
    return res.status(400).write("Invalid image type");
  }

  const embedURL = buildEmbedURL(trackURL);
  try {
    const image = await screenshot(embedURL, imageType);
    //

    res.setHeader("X-Robots-Tag", "noindex");
    res.setHeader("Link", `<${embedURL}>; rel="canonical"`);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "max-age=86400, public, stale-while-revalidate");
    res.setHeader("Content-DPR", "2.0");
    res.send(image);
  } catch {
    return res.status(500);
  }
};

export default api;
