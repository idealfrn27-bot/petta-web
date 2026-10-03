from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "images" / "v5"
GENERATED = Path(r"C:\Users\IDEAL FRN\.codex\generated_images\01a05d84-966e-7e11-a63d-ff48b72da1db")
CANVAS = (2560, 1600)


def key_green(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGB")
    rgb = np.asarray(image, dtype=np.float32)
    green_strength = rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])
    alpha = 255 - np.clip((green_strength - 10) / 105 * 255, 0, 255)
    rgb[..., 1] = np.minimum(rgb[..., 1], np.maximum(rgb[..., 0], rgb[..., 2]) * 1.02 + 2)
    rgba = np.dstack((np.clip(rgb, 0, 255).astype(np.uint8), alpha.astype(np.uint8)))
    result = Image.fromarray(rgba, "RGBA")
    bbox = result.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"No foreground found in {source}")
    return result.crop(bbox)


def place(source: Path, destination: Path, size: tuple[int, int], xy: tuple[int, int]) -> None:
    cutout = key_green(source).resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(cutout, xy)
    canvas.save(destination, optimize=True)
    print(destination.name, cutout.size, xy)


place(
    GENERATED / "exec-41d1ba50-20e6-41ea-8444-f870f68eae8e.png",
    ASSETS / "hero-dog-head-alpha.png",
    (1010, 960),
    (1260, 135),
)
place(
    GENERATED / "exec-2d7c26c6-9b85-4a28-801e-44650d0e08df.png",
    ASSETS / "hero-cat-paw-alpha.png",
    (350, 590),
    (660, 700),
)
