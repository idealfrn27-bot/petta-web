from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
FRAME_DIR = ROOT / "public" / "images" / "v5" / "logic" / "notice-walk-frames-v1"
OUTPUT = ROOT / "public" / "images" / "v5" / "logic" / "logic-notice-golden-walk-v1.webp"
POSTER = ROOT / "public" / "images" / "v5" / "logic" / "logic-notice-golden-poster-v1.webp"

FRAME_NAMES = [
    "frame-01.png",
    "inbetween-01.png",
    "inbetween-02.png",
    "frame-02.png",
    "inbetween-03.png",
    "inbetween-04.png",
    "frame-03.png",
    "inbetween-05.png",
    "inbetween-06.png",
    "frame-04.png",
    "inbetween-07.png",
    "inbetween-08.png",
    "frame-05.png",
    "inbetween-09.png",
    "inbetween-10.png",
    "frame-06.png",
]
TARGET_SIZE = (1280, 720)


def cover(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    target_ratio = TARGET_SIZE[0] / TARGET_SIZE[1]
    source_ratio = image.width / image.height
    if source_ratio > target_ratio:
        width = round(image.height * target_ratio)
        left = (image.width - width) // 2
        image = image.crop((left, 0, left + width, image.height))
    else:
        height = round(image.width / target_ratio)
        top = (image.height - height) // 2
        image = image.crop((0, top, image.width, top + height))
    return image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)


frames = [cover(Image.open(FRAME_DIR / name)) for name in FRAME_NAMES]

# Six keyframes plus two generated anatomical in-betweens per transition.
# Every frame is a discrete pose: no transparent dissolve or double exposure.
timeline = frames
durations = [375] * len(timeline)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
timeline[0].save(
    OUTPUT,
    save_all=True,
    append_images=timeline[1:],
    duration=durations,
    loop=0,
    quality=82,
    method=6,
)
frames[0].save(POSTER, "WEBP", quality=88, method=6)

print(OUTPUT)
print(POSTER)
print(f"duration_ms={sum(durations)} frames={len(timeline)}")
