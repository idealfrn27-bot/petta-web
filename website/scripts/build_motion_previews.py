from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "website" / "public" / "previews"
OUT.mkdir(parents=True, exist_ok=True)

SOURCE_ONE = Path(r"C:\Users\IDEAL FRN\.codex\generated_images\01a05d84-966e-7e11-a63d-ff48b72da1db\exec-18896b0a-32fa-4b9c-b8c6-6f6b986ed2ae.png")
SOURCE_TWO = Path(r"C:\Users\IDEAL FRN\.codex\generated_images\01a05d84-966e-7e11-a63d-ff48b72da1db\exec-7b2dc51c-6982-4ca7-9307-3188fb660b3f.png")

FONT_REGULAR = Path(r"C:\Windows\Fonts\msyh.ttc")
FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")


def smoothstep(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def phase_alpha(t: float) -> float:
    if t < 0.18:
        return smoothstep(t / 0.18)
    if t < 0.76:
        return 1.0
    return 1.0 - smoothstep((t - 0.76) / 0.24)


def camera_push(image: Image.Image, t: float, focus: tuple[float, float], amount: float) -> Image.Image:
    pulse = math.sin(math.pi * t) ** 2
    scale = 1.0 + amount * pulse
    width, height = image.size
    crop_w = width / scale
    crop_h = height / scale
    fx, fy = focus
    left = fx - (fx / width) * crop_w
    top = fy - (fy / height) * crop_h
    left = max(0.0, min(width - crop_w, left))
    top = max(0.0, min(height - crop_h, top))
    crop = image.crop((left, top, left + crop_w, top + crop_h))
    return crop.resize((width, height), Image.Resampling.LANCZOS)


def screen_glow(size: tuple[int, int], center: tuple[int, int], radius: int, strength: int) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx, cy = center
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=(255, 170, 112, strength))
    return layer.filter(ImageFilter.GaussianBlur(radius // 2))


def save_gif_preview(frames: list[Image.Image], path: Path) -> None:
    gif_frames = [
        frame.resize((768, 432), Image.Resampling.LANCZOS).convert("P", palette=Image.Palette.ADAPTIVE, colors=128)
        for frame in frames
    ]
    gif_frames[0].save(
        path,
        save_all=True,
        append_images=gif_frames[1:],
        duration=200,
        loop=0,
        disposal=2,
        optimize=False,
    )


def make_card(
    size: tuple[int, int],
    title: str,
    body: str,
    alpha: int,
    compact: bool,
) -> Image.Image:
    width, height = size
    card = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    radius = max(8, height // 5)
    draw.rounded_rectangle((1, 1, width - 2, height - 2), radius=radius, fill=(250, 246, 239, alpha), outline=(255, 255, 255, min(220, alpha)), width=1)
    dot_r = max(3, height // 12)
    draw.ellipse((10, 10, 10 + dot_r * 2, 10 + dot_r * 2), fill=(240, 102, 68, alpha))
    if compact:
        draw.rounded_rectangle((22, 7, width - 7, 10), radius=2, fill=(84, 80, 76, int(alpha * 0.72)))
        draw.rounded_rectangle((22, 13, width - 13, 16), radius=2, fill=(148, 140, 131, int(alpha * 0.55)))
        draw.rounded_rectangle((22, 18, width - 20, 20), radius=1, fill=(148, 140, 131, int(alpha * 0.42)))
    else:
        font_title = ImageFont.truetype(str(FONT_BOLD), 11)
        font_body = ImageFont.truetype(str(FONT_REGULAR), 8)
        draw.text((24, 7), title, font=font_title, fill=(47, 44, 42, alpha))
        draw.text((10, 27), body, font=font_body, fill=(98, 91, 86, int(alpha * 0.86)))
        draw.rounded_rectangle((14, height - 18, width - 44, height - 13), radius=3, fill=(222, 211, 199, int(alpha * 0.72)))
    return card


def paste_rotated(
    base: Image.Image,
    overlay: Image.Image,
    center: tuple[int, int],
    angle: float,
    clip_polygon: list[tuple[int, int]] | None = None,
) -> None:
    rotated = overlay.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    x = int(center[0] - rotated.width / 2)
    y = int(center[1] - rotated.height / 2)
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer.alpha_composite(rotated, (x, y))
    if clip_polygon:
        mask = Image.new("L", base.size, 0)
        ImageDraw.Draw(mask).polygon(clip_polygon, fill=255)
        layer.putalpha(Image.composite(layer.getchannel("A"), Image.new("L", base.size, 0), mask))
    base.alpha_composite(layer)


def build_entryway() -> Path:
    base = Image.open(SOURCE_ONE).convert("RGB").resize((1024, 576), Image.Resampling.LANCZOS)
    frames: list[Image.Image] = []
    count = 25
    for index in range(count):
        t = index / count
        alpha = phase_alpha(t)
        frame = base.convert("RGBA")
        glow_strength = int(50 * alpha * (0.84 + 0.16 * math.sin(t * math.pi * 6)))
        frame = Image.alpha_composite(frame, screen_glow(frame.size, (739, 288), 61, glow_strength))
        card = make_card((56, 24), "", "", int(236 * alpha), compact=True)
        enter = smoothstep(min(1.0, t / 0.2))
        y = int(278 - (1.0 - enter) * 26)
        paste_rotated(frame, card, (732, y), 14, [(708, 250), (762, 266), (746, 312), (694, 296)])
        frame = camera_push(frame.convert("RGB"), t, (744, 292), 0.022)
        frames.append(frame)
    path = OUT / "explain-entryway-5s.webp"
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=200, loop=0, quality=78, method=3)
    save_gif_preview(frames, OUT / "explain-entryway-5s.gif")
    frames[12].save(OUT / "explain-entryway-poster.png", optimize=True)
    return path


def build_diary() -> Path:
    base = Image.open(SOURCE_TWO).convert("RGB").resize((1024, 576), Image.Resampling.LANCZOS)
    frames: list[Image.Image] = []
    count = 26
    for index in range(count):
        t = index / count
        alpha = phase_alpha(t)
        frame = base.convert("RGBA")
        glow_strength = int(62 * alpha * (0.86 + 0.14 * math.sin(t * math.pi * 5)))
        frame = Image.alpha_composite(frame, screen_glow(frame.size, (632, 309), 98, glow_strength))
        card = make_card((104, 58), "Momo 日记", "今天散步很开心", int(245 * alpha), compact=False)
        enter = smoothstep(min(1.0, t / 0.24))
        y = int(302 + (1.0 - enter) * 78)
        paste_rotated(frame, card, (626, y), -6, [(564, 175), (641, 170), (685, 354), (609, 369)])
        frame = camera_push(frame.convert("RGB"), t, (632, 312), 0.028)
        frames.append(frame)
    path = OUT / "explain-diary-5s.webp"
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=200, loop=0, quality=78, method=3)
    save_gif_preview(frames, OUT / "explain-diary-5s.gif")
    frames[13].save(OUT / "explain-diary-poster.png", optimize=True)
    return path


if __name__ == "__main__":
    print(build_entryway())
    print(build_diary())
