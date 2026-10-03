from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "images" / "v5"
SOURCE_ROOT = Path(r"C:\Users\IDEAL FRN\.codex\generated_images\01a05d84-966e-7e11-a63d-ff48b72da1db")


def fit_layer(source: Path, destination: Path, roi: tuple[float, float, float, float]) -> None:
    target_full = Image.open(ASSETS / "hero-pets-v5.png").convert("RGB")
    source_full = Image.open(source).convert("RGB").resize(target_full.size, Image.Resampling.LANCZOS)

    width, height = 320, 200
    target = target_full.resize((width, height), Image.Resampling.LANCZOS).convert("L").filter(ImageFilter.FIND_EDGES)
    source_small = source_full.resize((width, height), Image.Resampling.LANCZOS).convert("L").filter(ImageFilter.FIND_EDGES)
    target_array = np.asarray(target, dtype=np.float32)
    x0, y0, x1, y1 = (int(roi[0] * width), int(roi[1] * height), int(roi[2] * width), int(roi[3] * height))

    best: tuple[float, int, int, float] | None = None
    for scale in np.linspace(0.92, 1.08, 17):
        scaled = source_small.resize((round(width * scale), round(height * scale)), Image.Resampling.BICUBIC)
        for dx in range(-20, 21, 2):
            for dy in range(-16, 17, 2):
                canvas = Image.new("L", (width, height))
                canvas.paste(scaled, ((width - scaled.width) // 2 + dx, (height - scaled.height) // 2 + dy))
                candidate = np.asarray(canvas, dtype=np.float32)
                delta = target_array[y0:y1, x0:x1] - candidate[y0:y1, x0:x1]
                score = float(np.mean(delta * delta))
                if best is None or score < best[3]:
                    best = (float(scale), dx, dy, score)

    assert best is not None
    scale, dx, dy, score = best
    scaled_full = source_full.resize((round(target_full.width * scale), round(target_full.height * scale)), Image.Resampling.LANCZOS)
    aligned = Image.new("RGB", target_full.size, (244, 239, 230))
    aligned.paste(
        scaled_full,
        (
            (target_full.width - scaled_full.width) // 2 + dx * (target_full.width // width),
            (target_full.height - scaled_full.height) // 2 + dy * (target_full.height // height),
        ),
    )
    aligned.save(destination, optimize=True)
    print(destination.name, {"scale": round(scale, 3), "dx": dx, "dy": dy, "score": round(score, 2)})


fit_layer(
    SOURCE_ROOT / "exec-c8f9be17-f870-406f-b69e-1c66b4530ad8.png",
    ASSETS / "hero-dog-tilt-end.png",
    (0.63, 0.62, 0.98, 0.98),
)
fit_layer(
    SOURCE_ROOT / "exec-62d27838-7147-4f22-96f7-9bc0692d047a.png",
    ASSETS / "hero-cat-reach-end.png",
    (0.30, 0.68, 0.67, 0.98),
)
