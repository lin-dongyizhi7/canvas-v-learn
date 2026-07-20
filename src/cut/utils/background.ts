import type { CutAsset } from "../types/editor";
import type { CutBackgroundStyle } from "../types/editor";

function clampColorChannel(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 255);
}

function normalizeHexColor(color: string) {
  const normalizedColor = color.trim().replace("#", "");

  if (normalizedColor.length === 3) {
    return normalizedColor
      .split("")
      .map((channel) => `${channel}${channel}`)
      .join("")
      .toUpperCase();
  }

  return normalizedColor.padEnd(6, "0").slice(0, 6).toUpperCase();
}

function toHexColor(color: string) {
  return `#${normalizeHexColor(color)}`;
}

function parseHexColor(color: string) {
  const normalizedColor = normalizeHexColor(color);
  return {
    redChannel: Number.parseInt(normalizedColor.slice(0, 2), 16),
    greenChannel: Number.parseInt(normalizedColor.slice(2, 4), 16),
    blueChannel: Number.parseInt(normalizedColor.slice(4, 6), 16),
  };
}

function getBackgroundAccentColor(color: string) {
  const { redChannel, greenChannel, blueChannel } = parseHexColor(color);

  // 用一个稍深的辅助色保留层次感，这样它看起来仍然是“纯色背景”，但不会平得像一块未渲染完成的画布。
  return `#${[
    clampColorChannel(redChannel * 0.58),
    clampColorChannel(greenChannel * 0.58),
    clampColorChannel(blueChannel * 0.58),
  ]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function mixHexColors(startColor: string, endColor: string, weight: number) {
  const fromColor = parseHexColor(startColor);
  const toColor = parseHexColor(endColor);

  return `#${[
    clampColorChannel(
      fromColor.redChannel + (toColor.redChannel - fromColor.redChannel) * weight,
    ),
    clampColorChannel(
      fromColor.greenChannel +
        (toColor.greenChannel - fromColor.greenChannel) * weight,
    ),
    clampColorChannel(
      fromColor.blueChannel + (toColor.blueChannel - fromColor.blueChannel) * weight,
    ),
  ]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

export function resolveBackgroundStyle(
  backgroundStyle?: Partial<CutBackgroundStyle>,
): CutBackgroundStyle {
  const baseColor = toHexColor(backgroundStyle?.color ?? "#2A55E5");
  const accentColor = toHexColor(
    backgroundStyle?.accentColor ?? getBackgroundAccentColor(baseColor),
  );
  const gradientStrength = Math.min(
    Math.max(backgroundStyle?.gradientStrength ?? 0.85, 0),
    1,
  );

  return {
    color: baseColor,
    accentColor,
    gradientStrength,
  };
}

export function createSolidBackgroundDataUrl(
  title: string,
  backgroundStyle: Partial<CutBackgroundStyle>,
) {
  const resolvedBackgroundStyle = resolveBackgroundStyle(backgroundStyle);
  const gradientEndColor = mixHexColors(
    resolvedBackgroundStyle.color,
    resolvedBackgroundStyle.accentColor,
    resolvedBackgroundStyle.gradientStrength,
  );

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${resolvedBackgroundStyle.color}" />
          <stop offset="100%" stop-color="${gradientEndColor}" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" rx="40" fill="url(#bg)" />
      <text x="96" y="596" fill="rgba(255,255,255,0.88)" font-size="76" font-weight="700" font-family="Arial, PingFang SC, sans-serif">
        ${title}
      </text>
    </svg>
  `)}`;
}

export function isSolidBackgroundAsset(asset?: CutAsset) {
  if (!asset) {
    return false;
  }

  return (
    asset.mimeType === "image/svg+xml" &&
    (Boolean(asset.backgroundStyle?.color) ||
      asset.id.startsWith("asset-bg") ||
      asset.name.includes("纯色背景"))
  );
}
