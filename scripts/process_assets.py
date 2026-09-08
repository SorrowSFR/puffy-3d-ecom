#!/usr/bin/env python3
"""
Plushy Asset Processor
Segments, crops, despills, and organizes all image, 3D, and video assets
into the public/assets/ hierarchy.
"""

import os
import shutil
import cv2
import numpy as np
from PIL import Image

BASE_DIR = "/Users/premlal/Desktop/3D Ecom"
OUT_DIR = os.path.join(BASE_DIR, "public", "assets")

def ensure_dirs():
    dirs = [
        "brand",
        "products",
        "models",
        "mascot",
        "mascot/actions",
        "mascot/expressions",
        "mascot/accessories",
        "mascot/details",
        "particles/bubbles",
        "particles/sparkles",
        "particles/chrome-droplets",
        "particles/puffer-shapes",
        "particles/light-streaks",
        "particles/clouds",
        "backgrounds",
        "transitions",
        "sheets"
    ]
    for d in dirs:
        os.makedirs(os.path.join(OUT_DIR, d), exist_ok=True)
    print("Created output directories in", OUT_DIR)

def segment_and_save_alpha_sheet(sheet_path, out_subfolder, prefix, min_area=300, pad=4):
    print(f"Processing sheet: {sheet_path} -> {out_subfolder}")
    img = cv2.imread(sheet_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Error loading {sheet_path}")
        return 0
    
    alpha = img[:, :, 3]
    thresh = (alpha > 15).astype(np.uint8) * 255
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter valid contours
    valid = [c for c in contours if cv2.contourArea(c) >= min_area]
    # Sort top to bottom, then left to right
    valid.sort(key=lambda c: (cv2.boundingRect(c)[1] // 150, cv2.boundingRect(c)[0]))
    
    h_img, w_img = img.shape[:2]
    saved_count = 0
    for idx, c in enumerate(valid, 1):
        x, y, w, h = cv2.boundingRect(c)
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(w_img, x + w + pad)
        y2 = min(h_img, y + h + pad)
        
        crop = img[y1:y2, x1:x2]
        out_filename = os.path.join(OUT_DIR, out_subfolder, f"{prefix}-{idx:02d}.png")
        cv2.imwrite(out_filename, crop)
        saved_count += 1
        
    print(f"Saved {saved_count} sprites to {out_subfolder}")
    return saved_count

def process_logo():
    logo_path = os.path.join(BASE_DIR, "ChatGPT Image Sep 8, 2026, 04_40_22 PM (1).png")
    img = cv2.imread(logo_path, cv2.IMREAD_UNCHANGED)
    alpha = img[:, :, 3]
    ys, xs = np.where(alpha > 10)
    if len(xs) > 0 and len(ys) > 0:
        x1, x2 = max(0, xs.min() - 8), min(img.shape[1], xs.max() + 8)
        y1, y2 = max(0, ys.min() - 8), min(img.shape[0], ys.max() + 8)
        crop = img[y1:y2, x1:x2]
        out_path = os.path.join(OUT_DIR, "brand", "puffy-logo-iridescent.png")
        cv2.imwrite(out_path, crop)
        print("Processed logo saved to", out_path)

def process_jackets():
    jackets = [
        ("ChatGPT Image Sep 8, 2026, 04_40_22 PM (2).png", "jacket-silver-iridescent.png"),
        ("ChatGPT Image Sep 8, 2026, 04_40_22 PM (3).png", "jacket-pink-bubblegum.png"),
        ("ChatGPT Image Sep 8, 2026, 04_40_22 PM (4).png", "jacket-blue-aurora.png"),
    ]
    for src_name, dest_name in jackets:
        src_path = os.path.join(BASE_DIR, src_name)
        img = cv2.imread(src_path, cv2.IMREAD_UNCHANGED)
        alpha = img[:, :, 3]
        ys, xs = np.where(alpha > 10)
        if len(xs) > 0 and len(ys) > 0:
            x1, x2 = max(0, xs.min() - 8), min(img.shape[1], xs.max() + 8)
            y1, y2 = max(0, ys.min() - 8), min(img.shape[0], ys.max() + 8)
            crop = img[y1:y2, x1:x2]
            out_path = os.path.join(OUT_DIR, "products", dest_name)
            cv2.imwrite(out_path, crop)
            print(f"Processed jacket: {dest_name}")

    # Purple Hero Jacket:
    silver_path = os.path.join(OUT_DIR, "products", "jacket-silver-iridescent.png")
    silver = cv2.imread(silver_path, cv2.IMREAD_UNCHANGED)
    b, g, r, a = cv2.split(silver)
    rgb = cv2.merge([r, g, b])
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    # Shift to iridescent purple
    hsv[:, :, 0] = (hsv[:, :, 0] + 128) % 180
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.9 + 50, 0, 255)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * 0.95, 0, 255)
    purple_rgb = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
    pr, pg, pb = cv2.split(purple_rgb)
    purple_rgba = cv2.merge([pb, pg, pr, a])
    out_purple = os.path.join(OUT_DIR, "products", "jacket-purple-lumi.png")
    cv2.imwrite(out_purple, purple_rgba)
    print("Processed hero purple jacket saved to", out_purple)

def process_character_sheet():
    sheet_path = os.path.join(BASE_DIR, "ChatGPT Image Sep 8, 2026, 04_40_23 PM (6).png")
    img = Image.open(sheet_path)
    w, h = img.size
    print("Processing Character Sheet:", w, h)
    
    crops = {
        # Poses
        ("mascot", "puffy-front.png"): (40, 150, 395, 595),
        ("mascot", "puffy-side.png"): (410, 150, 680, 595),
        ("mascot", "puffy-back.png"): (680, 150, 1010, 595),
        # Actions
        ("mascot/actions", "bounce.png"): (20, 600, 290, 850),
        ("mascot/actions", "wave.png"): (290, 600, 550, 850),
        ("mascot/actions", "float.png"): (550, 600, 810, 850),
        ("mascot/actions", "squish.png"): (800, 620, 1090, 850),
        # Expressions
        ("mascot/expressions", "happy.png"): (30, 915, 140, 1030),
        ("mascot/expressions", "excited.png"): (150, 915, 260, 1030),
        ("mascot/expressions", "wink.png"): (270, 915, 380, 1030),
        ("mascot/expressions", "curious.png"): (30, 1045, 140, 1165),
        ("mascot/expressions", "sleepy.png"): (150, 1045, 260, 1165),
        ("mascot/expressions", "surprised.png"): (270, 1045, 380, 1165),
        # Details
        ("mascot/details", "star-zipper.png"): (415, 915, 545, 1045),
        ("mascot/details", "material-swatch.png"): (555, 915, 685, 1045),
        ("mascot/details", "ribbed-cuffs.png"): (700, 915, 815, 1045),
        # Accessories
        ("mascot/accessories", "star-bag.png"): (405, 1080, 510, 1195),
        ("mascot/accessories", "puffer-hat.png"): (515, 1080, 615, 1195),
        ("mascot/accessories", "headphones.png"): (620, 1080, 720, 1195),
        ("mascot/accessories", "puff-wings.png"): (725, 1080, 830, 1195),
    }
    
    for (folder, fname), box in crops.items():
        crop = img.crop(box)
        crop.save(os.path.join(OUT_DIR, folder, fname))
    print(f"Extracted {len(crops)} mascot assets")

def process_backgrounds_and_sheets():
    shutil.copy2(
        os.path.join(BASE_DIR, "ChatGPT Image Sep 8, 2026, 04_40_23 PM (5).png"),
        os.path.join(OUT_DIR, "sheets", "website-art-direction.png")
    )
    shutil.copy2(
        os.path.join(BASE_DIR, "ChatGPT Image Sep 8, 2026, 04_40_23 PM (6).png"),
        os.path.join(OUT_DIR, "sheets", "character-design-sheet.png")
    )
    
    bgs = [
        ("hero-dreamy-ocean-reflection.png", "hero-dreamy-ocean-reflection.png"),
        ("ChatGPT Image Sep 8, 2026, 05_06_58 PM (7).png", "hero-dreamy-sunset.png"),
        ("ChatGPT Image Sep 8, 2026, 05_06_58 PM (8).png", "hero-reflective-grid.png"),
        ("ChatGPT Image Sep 8, 2026, 05_06_58 PM (9).png", "sky-clouds-atmosphere.png"),
    ]
    for src_name, dest_name in bgs:
        src_path = os.path.join(BASE_DIR, src_name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, os.path.join(OUT_DIR, "backgrounds", dest_name))
            print(f"Copied background: {dest_name}")

def process_models_and_video():
    model_maps = [
        ("Meshy_AI_Iridescent_Purple_Puf_0908162158_texture.glb", "puffer-purple-lumi.glb"),
        ("Meshy_AI_Electric_Aurora_Puffe_0908162206_texture.glb", "puffer-electric-aurora.glb"),
        ("Meshy_AI_Electric_Aurora_Puffe_0908162206_texture.glb", "puffer-blue-aurora.glb"),
        ("Meshy_AI_Moonbeam_Puffer_0908162214_texture.glb", "puffer-moonbeam.glb"),
        ("Meshy_AI_Moonbeam_Puffer_0908162214_texture.glb", "puffer-silver-iridescent.glb"),
        ("Meshy_AI_Pink_Aurora_Puffer_Ja_0908162558_texture.glb", "puffer-pink-bubblegum.glb"),
    ]
    for src_name, dest_name in model_maps:
        src = os.path.join(BASE_DIR, src_name)
        dest = os.path.join(OUT_DIR, "models", dest_name)
        if os.path.exists(src):
            try:
                shutil.copy2(src, dest)
                print(f"Updated {src_name} -> {dest_name}")
            except Exception as e:
                print(f"Error copying {src_name}: {e}")
    
    vid_src = os.path.join(BASE_DIR, "Zipper-Reveal.mp4")
    vid_dest = os.path.join(OUT_DIR, "transitions", "zipper-reveal.mp4")
    if not os.path.exists(vid_dest):
        try:
            os.link(vid_src, vid_dest)
        except Exception:
            shutil.copy2(vid_src, vid_dest)
        print("Linked zipper-reveal.mp4")

def main():
    ensure_dirs()
    process_logo()
    process_jackets()
    process_character_sheet()
    process_backgrounds_and_sheets()
    process_models_and_video()
    
    particle_sheets = [
        ("ChatGPT Image Sep 8, 2026, 05_06_56 PM (1).png", "particles/bubbles", "bubble", 400),
        ("ChatGPT Image Sep 8, 2026, 05_06_56 PM (2).png", "particles/sparkles", "sparkle", 250),
        ("ChatGPT Image Sep 8, 2026, 05_06_57 PM (3).png", "particles/chrome-droplets", "droplet", 250),
        ("ChatGPT Image Sep 8, 2026, 05_06_57 PM (4).png", "particles/light-streaks", "streak", 300),
        ("ChatGPT Image Sep 8, 2026, 05_06_57 PM (5).png", "particles/puffer-shapes", "shape", 350),
        ("ChatGPT Image Sep 8, 2026, 05_06_58 PM (6).png", "particles/clouds", "cloud", 450),
    ]
    
    total_particles = 0
    for src_name, out_sub, prefix, min_area in particle_sheets:
        src_path = os.path.join(BASE_DIR, src_name)
        count = segment_and_save_alpha_sheet(src_path, out_sub, prefix, min_area=min_area)
        total_particles += count
        
    print(f"\n==========================================")
    print(f"ASSET PROCESSING COMPLETE! Total particle sprites: {total_particles}")
    print(f"==========================================")

if __name__ == "__main__":
    main()
