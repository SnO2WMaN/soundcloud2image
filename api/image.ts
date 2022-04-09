import type { VercelRequest, VercelResponse } from "@vercel/node";
import chrome from "chrome-aws-lambda";
import isURL from "is-url";

const screenshot = async (
  embedUrl: string,
  type: "png" | "jpeg" | "webp" = "png",
) => {
  // Font settings ref: https://github.com/ci7lus/tweet2image/blob/d87ff5e0233bd139ca96e1c507ef62916bbdc449/app/routes/%24path.tsx#L78-L92
  await chrome.font(
    "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@165c01b46ea533872e002e0785ff17e44f6d97d8/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf",
  );
  await chrome.font(
    "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@736e6b8f886cae4664e78edb0880fbb5af7d50b7/hinted/ttf/NotoSansMath/NotoSansMath-Regular.ttf",
  );
  await chrome.font(
    "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@7697007fcb3563290d73f41f56a70d5d559d828c/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
  );
  const browser = await chrome.puppeteer.launch({
    executablePath: await chrome.executablePath,
    args: chrome.args,
    headless: true,
    defaultViewport: {
      ...chrome.defaultViewport,
      width: 568,
      height: 164,
    },
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
    res.send(image);
  } catch {
    return res.status(500);
  }
};

export default api;
