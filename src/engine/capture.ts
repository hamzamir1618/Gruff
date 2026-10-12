// Photographs a printed page (a DOM element) into a canvas, so it can be bent in WebGL.
// The browser renders the page itself through an SVG foreignObject, so the picture matches the DOM exactly.
import { getFontEmbedCSS, toCanvas } from 'html-to-image';

let fontCSS: Promise<string> | null = null;

export async function capture(el: HTMLElement, w: number, h: number, pixelRatio: number) {
  fontCSS ??= getFontEmbedCSS(el).catch(() => '');
  return toCanvas(el, {
    width: w,
    height: h,
    canvasWidth: w,
    canvasHeight: h,
    pixelRatio,
    fontEmbedCSS: await fontCSS,
    cacheBust: false,
    skipAutoScale: true,
    // the page is scaled on screen; photograph it at its design size
    style: { transform: 'none', left: '0', top: '0', visibility: 'visible', opacity: '1' },
  });
}

if (import.meta.env.DEV) Object.assign(window, { __capture: capture });
