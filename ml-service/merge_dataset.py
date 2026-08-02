"""
Merges your downloaded dataset folders into the 8-category structure
train.py expects:

  ml-service/data/train/<category>/*.jpg
  ml-service/data/val/<category>/*.jpg

HOW TO USE:
1. Edit SOURCE_MAP below — replace the placeholder paths with the real
   paths to your extracted dataset folders. You already have the Garbage
   Classification folders visible (paper, plastic, biological, glass,
   battery, metal, clothes, shoes, trash) — just point to those. Plus
   your separate e-waste dataset folder for "ewaste".
2. Run:  python merge_dataset.py
3. It copies + splits 80/20 automatically. Safe to re-run.
"""

import os
import random
import shutil

# ---- EDIT THESE PATHS to match where you extracted your datasets ----
GARBAGE_ROOT = r"C:\Users\varun\Downloads\garbage_classification"   # <-- the folder containing paper, plastic, biological, etc.
EWASTE_ROOT = r"C:\Users\varun\Downloads\ewaste"            # <-- your separate e-waste dataset folder

SOURCE_MAP = {
    "paper": [
        os.path.join(GARBAGE_ROOT, "paper"),
        # os.path.join(GARBAGE_ROOT, "cardboard"),  # uncomment if this folder exists in your download
    ],
    "plastic": [
        os.path.join(GARBAGE_ROOT, "plastic"),
    ],
    "organic": [
        os.path.join(GARBAGE_ROOT, "biological"),
    ],
    "glass": [
        os.path.join(GARBAGE_ROOT, "glass"),
    ],
    "ewaste": [
        os.path.join(GARBAGE_ROOT, "battery"),
        EWASTE_ROOT,  # point this directly at the folder containing e-waste images
    ],
    "metal": [
        os.path.join(GARBAGE_ROOT, "metal"),
    ],
    "textile": [
        os.path.join(GARBAGE_ROOT, "clothes"),
        os.path.join(GARBAGE_ROOT, "shoes"),
    ],
    "trash": [
        os.path.join(GARBAGE_ROOT, "trash"),
    ],
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
VAL_SPLIT = 0.2
VALID_EXTENSIONS = (".jpg", ".jpeg", ".png")
MAX_IMAGES_PER_CATEGORY = 400  # caps large folders (like your 2GB e-waste set) to avoid class imbalance
random.seed(42)


def collect_images(folder):
    if not os.path.isdir(folder):
        print(f"  WARNING: folder not found, skipping: {folder}")
        return []
    return [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if f.lower().endswith(VALID_EXTENSIONS)
    ]


def main():
    for category, source_folders in SOURCE_MAP.items():
        print(f"\nCategory: {category}")

        all_images = []
        for folder in source_folders:
            imgs = collect_images(folder)
            print(f"  {folder} -> {len(imgs)} images")
            all_images.extend(imgs)

        if not all_images:
            print(f"  No images found for '{category}' — check your SOURCE_MAP paths.")
            continue

        random.shuffle(all_images)

        if len(all_images) > MAX_IMAGES_PER_CATEGORY:
            print(f"  Capping from {len(all_images)} to {MAX_IMAGES_PER_CATEGORY} images (for class balance)")
            all_images = all_images[:MAX_IMAGES_PER_CATEGORY]

        split_idx = int(len(all_images) * (1 - VAL_SPLIT))
        train_imgs = all_images[:split_idx]
        val_imgs = all_images[split_idx:]

        train_dest = os.path.join(OUTPUT_DIR, "train", category)
        val_dest = os.path.join(OUTPUT_DIR, "val", category)
        os.makedirs(train_dest, exist_ok=True)
        os.makedirs(val_dest, exist_ok=True)

        for i, src in enumerate(train_imgs):
            dest = os.path.join(train_dest, f"{category}_{i}{os.path.splitext(src)[1]}")
            if not os.path.exists(dest):
                shutil.copy2(src, dest)

        for i, src in enumerate(val_imgs):
            dest = os.path.join(val_dest, f"{category}_{i}{os.path.splitext(src)[1]}")
            if not os.path.exists(dest):
                shutil.copy2(src, dest)

        print(f"  -> {len(train_imgs)} train / {len(val_imgs)} val copied")

    print("\nDone. Your data/ folder is ready for train.py")


if __name__ == "__main__":
    main()
