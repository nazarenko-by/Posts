"""SSIM кожного закодованого варіанту проти source.png і підбір найменшого файлу під цільову якість.

    python3 scripts/ssim.py  →  results.json

SSIM рахується на яскравості (Y з BT.601, як у класичній роботі Wang et al. 2004): гаусове вікно σ = 1.5,
data_range = 255 (skimage.metrics.structural_similarity з gaussian_weights=True, use_sample_covariance=False).
Для кожного формату й цілі (0.95 / 0.97 / 0.98) береться найменший файл, у якого SSIM ≥ цілі.
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
TARGETS = [0.95, 0.97, 0.98]


def luma(rgb: np.ndarray) -> np.ndarray:
    rgb = rgb.astype(np.float64)
    return 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]


src = np.asarray(Image.open(ROOT / "source.png").convert("RGB"))
src_y = luma(src)
meta = json.loads((OUT / "encode.json").read_text())
h, w = meta["height"], meta["width"]

rows = []
for r in meta["rows"]:
    rgba = np.frombuffer((OUT / r["file"]).with_suffix(".rgba").read_bytes(), dtype=np.uint8).reshape(h, w, 4)
    s = structural_similarity(src_y, luma(rgba[..., :3]), data_range=255, gaussian_weights=True,
                              sigma=1.5, use_sample_covariance=False)
    rows.append({**r, "ssim": round(float(s), 5)})
    print(f'{r["format"]:5} q{r["quality"]:<3} {r["bytes"]:>8} B  SSIM {s:.4f}')

picks = {}
for t in TARGETS:
    picks[str(t)] = {}
    for fmt in ["jpeg", "webp", "avif", "jxl"]:
        ok = [r for r in rows if r["format"] == fmt and r["ssim"] >= t]
        best = min(ok, key=lambda r: r["bytes"]) if ok else None
        picks[str(t)][fmt] = best

source_png = (ROOT / "source.png").stat().st_size
(ROOT / "results.json").write_text(json.dumps(
    {"width": w, "height": h, "sourcePngBytes": source_png, "targets": TARGETS, "picks": picks, "rows": rows},
    ensure_ascii=False, indent=1))

print("\nнайменший файл із SSIM ≥ цілі (KB, quality):")
for t in TARGETS:
    line = [f"{t}:"]
    for fmt, r in picks[str(t)].items():
        line.append(f'{fmt} {r["bytes"] / 1024:.0f} KB (q{r["quality"]})' if r else f"{fmt} -")
    print("  ".join(line))
