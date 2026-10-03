from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "website" / "public" / "previews" / "explain-storyboards"
ENTRY_OUT = OUT / "01-entryway-alert"
DIARY_OUT = OUT / "02-diary-message"
ENTRY_OUT.mkdir(parents=True, exist_ok=True)
DIARY_OUT.mkdir(parents=True, exist_ok=True)

SOURCE_ENTRY = Path(r"C:\Users\IDEAL FRN\.codex\generated_images\01a05d84-966e-7e11-a63d-ff48b72da1db\exec-18896b0a-32fa-4b9c-b8c6-6f6b986ed2ae.png")
SOURCE_DIARY = Path(r"C:\Users\IDEAL FRN\.codex\generated_images\01a05d84-966e-7e11-a63d-ff48b72da1db\exec-7b2dc51c-6982-4ca7-9307-3188fb660b3f.png")

FONT_REGULAR = Path(r"C:\Windows\Fonts\msyh.ttc")
FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")

CANVAS = (1280, 720)
UI_SIZE = (360, 600)
FRAME_MS = 500


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def smoothstep(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def perspective_coefficients(dest: list[tuple[float, float]], src: list[tuple[float, float]]) -> tuple[float, ...]:
    rows = []
    values = []
    for (x, y), (u, v) in zip(dest, src):
        rows.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        values.append(u)
        rows.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        values.append(v)
    return tuple(np.linalg.solve(np.asarray(rows, dtype=float), np.asarray(values, dtype=float)))


def warp_ui(ui: Image.Image, canvas_size: tuple[int, int], quad: list[tuple[int, int]]) -> Image.Image:
    width, height = ui.size
    src = [(0, 0), (width - 1, 0), (width - 1, height - 1), (0, height - 1)]
    coeffs = perspective_coefficients(quad, src)
    warped = ui.transform(canvas_size, Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)
    mask = Image.new("L", canvas_size, 0)
    ImageDraw.Draw(mask).polygon(quad, fill=255)
    warped.putalpha(Image.composite(warped.getchannel("A"), Image.new("L", canvas_size, 0), mask))
    return warped


def camera_push(image: Image.Image, frame_index: int, count: int, focus: tuple[float, float], amount: float) -> Image.Image:
    t = frame_index / max(1, count - 1)
    pulse = math.sin(math.pi * t) ** 2
    scale = 1.0 + amount * pulse
    width, height = image.size
    crop_w, crop_h = width / scale, height / scale
    fx, fy = focus
    left = max(0.0, min(width - crop_w, fx - (fx / width) * crop_w))
    top = max(0.0, min(height - crop_h, fy - (fy / height) * crop_h))
    return image.crop((left, top, left + crop_w, top + crop_h)).resize(image.size, Image.Resampling.LANCZOS)


def base_phone_ui() -> Image.Image:
    return Image.new("RGBA", UI_SIZE, (0, 0, 0, 0))


def draw_alert_ui(expand: float, text_alpha: float, pulse: float) -> Image.Image:
    ui = base_phone_ui()
    draw = ImageDraw.Draw(ui, "RGBA")
    expand = smoothstep(expand)
    width = int(80 + 236 * expand)
    height = int(44 + 150 * expand)
    left = (UI_SIZE[0] - width) // 2
    top = 138
    shadow = Image.new("RGBA", UI_SIZE, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((left + 5, top + 8, left + width + 5, top + height + 8), radius=24, fill=(54, 39, 31, int(42 * expand)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    ui = Image.alpha_composite(ui, shadow)
    draw = ImageDraw.Draw(ui, "RGBA")
    draw.rounded_rectangle((left, top, left + width, top + height), radius=22, fill=(255, 250, 245, 250), outline=(244, 215, 198, 255), width=2)
    glow = int(70 + 80 * pulse)
    draw.ellipse((left + 17, top + 15, left + 45, top + 43), fill=(244, 104, 71, 255), outline=(255, 190, 167, glow), width=4)
    if expand > 0.35:
        alpha = int(255 * text_alpha)
        draw.text((left + 57, top + 13), "状态提醒", font=font(22, True), fill=(54, 49, 46, alpha))
        draw.text((left + 20, top + 62), "Momo 今天下午比平时安静", font=font(18, True), fill=(54, 49, 46, alpha))
        draw.text((left + 20, top + 96), "建议先确认饮水与精神状态", font=font(15), fill=(111, 99, 92, int(alpha * 0.88)))
        draw.text((left + 20, top + 130), "仅供日常观察参考", font=font(12), fill=(154, 143, 135, int(alpha * 0.75)))
    return ui


def draw_diary_ui(expand: float, text_alpha: float, pulse: float) -> Image.Image:
    ui = base_phone_ui()
    expand = smoothstep(expand)
    sheet_h = int(74 + 390 * expand)
    top = UI_SIZE[1] - sheet_h
    shadow = Image.new("RGBA", UI_SIZE, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((16, top + 7, 344, UI_SIZE[1] + 18), radius=30, fill=(45, 33, 26, int(50 * expand)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    ui = Image.alpha_composite(ui, shadow)
    draw = ImageDraw.Draw(ui, "RGBA")
    draw.rounded_rectangle((14, top, 346, UI_SIZE[1] + 20), radius=30, fill=(255, 251, 245, 252), outline=(240, 216, 199, 255), width=2)
    draw.rounded_rectangle((142, top + 12, 218, top + 19), radius=4, fill=(210, 197, 187, 255))
    if expand > 0.25:
        alpha = int(255 * text_alpha)
        ring = int(4 + 2 * pulse)
        draw.ellipse((36 - ring, top + 42 - ring, 104 + ring, top + 110 + ring), fill=(236, 204, 174, alpha), outline=(244, 105, 70, int(alpha * 0.72)), width=3)
        draw.text((124, top + 42), "Momo 的宠物日记", font=font(23, True), fill=(50, 46, 43, alpha))
        draw.text((36, top + 142), "今天散步很开心，", font=font(20, True), fill=(50, 46, 43, alpha))
        draw.text((36, top + 179), "回家后睡得也很香。", font=font(20, True), fill=(50, 46, 43, alpha))
        draw.rounded_rectangle((36, top + 232, 310, top + 251), radius=9, fill=(226, 214, 203, int(alpha * 0.9)))
        draw.rounded_rectangle((36, top + 270, 276, top + 289), radius=9, fill=(226, 214, 203, int(alpha * 0.72)))
        draw.text((36, top + 330), "今天也有好好生活。", font=font(16), fill=(120, 106, 97, int(alpha * 0.86)))
    return ui


def stages() -> list[tuple[float, float, float]]:
    return [
        (0.00, 0.00, 0.00),
        (0.08, 0.00, 0.20),
        (0.24, 0.00, 0.35),
        (0.48, 0.10, 0.55),
        (0.72, 0.35, 0.75),
        (0.92, 0.70, 0.90),
        (1.00, 1.00, 1.00),
        (1.00, 1.00, 0.75),
        (1.00, 1.00, 0.45),
        (1.00, 1.00, 0.80),
        (1.00, 1.00, 1.00),
        (0.68, 0.70, 0.55),
        (0.28, 0.15, 0.25),
        (0.00, 0.00, 0.00),
    ]


def save_animation(frames: list[Image.Image], folder: Path, stem: str) -> None:
    webp = folder / f"{stem}-7s.webp"
    gif = folder / f"{stem}-7s.gif"
    frames[0].save(webp, save_all=True, append_images=frames[1:], duration=FRAME_MS, loop=0, quality=84, method=3)
    gif_frames = [frame.resize((768, 432), Image.Resampling.LANCZOS).convert("P", palette=Image.Palette.ADAPTIVE, colors=160) for frame in frames]
    gif_frames[0].save(gif, save_all=True, append_images=gif_frames[1:], duration=FRAME_MS, loop=0, disposal=2, optimize=False)


def save_contact_sheet(frames: list[Image.Image], folder: Path, stem: str) -> None:
    thumb_w, thumb_h = 320, 180
    sheet = Image.new("RGB", (thumb_w * 4, (thumb_h + 30) * 4), (239, 234, 227))
    draw = ImageDraw.Draw(sheet)
    label_font = font(16, True)
    for index, frame in enumerate(frames):
        col, row = index % 4, index // 4
        x, y = col * thumb_w, row * (thumb_h + 30)
        sheet.paste(frame.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (x, y))
        draw.text((x + 10, y + thumb_h + 5), f"FRAME {index + 1:02d}", font=label_font, fill=(76, 70, 66))
    sheet.save(folder / f"{stem}-contact-sheet.jpg", quality=92)


def build_sequence(source: Path, folder: Path, kind: str, quad: list[tuple[int, int]], focus: tuple[int, int]) -> list[Image.Image]:
    base = Image.open(source).convert("RGB").resize(CANVAS, Image.Resampling.LANCZOS)
    timeline = stages()
    frames: list[Image.Image] = []
    for index, (expand, alpha, pulse) in enumerate(timeline):
        ui = draw_alert_ui(expand, alpha, pulse) if kind == "alert" else draw_diary_ui(expand, alpha, pulse)
        frame = base.convert("RGBA")
        frame = Image.alpha_composite(frame, warp_ui(ui, CANVAS, quad))
        frame = camera_push(frame.convert("RGB"), index, len(timeline), focus, 0.018 if kind == "alert" else 0.024)
        frame_path = folder / f"frame-{index + 1:02d}.png"
        frame.save(frame_path, optimize=True)
        frames.append(frame)
    return frames


def main() -> None:
    entry_frames = build_sequence(
        SOURCE_ENTRY,
        ENTRY_OUT,
        "alert",
        [(891, 318), (943, 333), (923, 379), (878, 365)],
        (920, 350),
    )
    diary_frames = build_sequence(
        SOURCE_DIARY,
        DIARY_OUT,
        "diary",
        [(716, 226), (790, 220), (838, 423), (765, 443)],
        (780, 350),
    )
    save_contact_sheet(entry_frames, ENTRY_OUT, "entryway-alert")
    save_contact_sheet(diary_frames, DIARY_OUT, "diary-message")
    save_animation(entry_frames, ENTRY_OUT, "entryway-alert")
    save_animation(diary_frames, DIARY_OUT, "diary-message")
    print(ENTRY_OUT)
    print(DIARY_OUT)


if __name__ == "__main__":
    main()
