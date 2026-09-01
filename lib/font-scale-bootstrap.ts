export const FONT_SCALE_BOOTSTRAP = `
(function () {
  try {
    var raw = localStorage.getItem("sns-font-scale-v1");
    if (!raw) return;
    var scale = parseFloat(raw);
    if (!Number.isFinite(scale)) return;
    scale = Math.round(scale * 100);
    scale = Math.round(scale / 5) * 5;
    if (scale < 85 || scale > 125) return;
    scale = scale / 100;
    var root = document.documentElement;
    root.style.setProperty("--font-scale", String(scale));
    root.style.fontSize = scale === 1 ? "" : scale * 100 + "%";
    root.dataset.fontScale = String(scale);
  } catch (e) {}
})();
`;
