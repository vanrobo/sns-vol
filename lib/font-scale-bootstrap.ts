export const FONT_SCALE_BOOTSTRAP = `
(function () {
  try {
    var raw = localStorage.getItem("sns-font-scale-v1");
    if (!raw) return;
    var scale = parseFloat(raw);
    if (!Number.isFinite(scale) || scale < 0.85 || scale > 1.25) return;
    var root = document.documentElement;
    root.style.setProperty("--font-scale", String(scale));
    root.style.fontSize = scale === 1 ? "" : scale * 100 + "%";
    root.dataset.fontScale = String(scale);
  } catch (e) {}
})();
`;
