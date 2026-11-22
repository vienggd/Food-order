"""Crop the full-resolution Lab 5 screenshots to the part that matters (handout section 12:
readable at 100%, never a full screen shrunk to fit). Originals stay in docs/labs/lab-05/evidence/;
crops go to docs/labs/lab-05/evidence/crop/. Boxes are (left, top, right, bottom) in pixels of the
1920x1032 original; row 45 is just above the address bar, so every crop keeps the URL visible.
Usage: python scripts/lab5-crop.py   (needs Pillow)
"""
from pathlib import Path
from PIL import Image

EVIDENCE = Path(__file__).resolve().parents[1] / "docs" / "labs" / "lab-05" / "evidence"
CROPS = {
    "c02-gate-run-failed.png": (0, 45, 1530, 930),
    "c06-deploy-run-release2.png": (0, 45, 1000, 645),
    "c06-deploy-run-release3.png": (0, 45, 1000, 645),
    "c06-live-release-note.png": (0, 45, 1920, 175),
    "c05-login-after-rollback.png": (0, 45, 1920, 175),
    "gcp-01-billing-overview.png": (0, 45, 1610, 760),
    "gcp-03-budget.png": (0, 45, 1610, 600),
    "gcp-04-iam.png": (0, 45, 1600, 765),
    "gcp-05b-cloud-sql-storage.png": (0, 45, 830, 720),
    "gcp-06-secret-names.png": (0, 45, 1190, 630),
    "gcp-07-deployer-no-keys.png": (0, 45, 1200, 710),
    "gcp-09-cloud-run-revisions.png": (0, 45, 1900, 1032),
    "gcp-10-artifact-registry.png": (0, 45, 1500, 690),
}


def main() -> None:
    out = EVIDENCE / "crop"
    out.mkdir(exist_ok=True)
    for name, box in CROPS.items():
        src = EVIDENCE / name
        if not src.exists():
            print("missing", name)
            continue
        Image.open(src).crop(box).save(out / name, optimize=True)
        print("cropped", name, box)
    # Screenshots added later by name pattern (C-04/C-05 from the team) are copied as they are.
    for src in sorted(EVIDENCE.glob("c0[245]-*.png")):
        if src.name not in CROPS and not (out / src.name).exists():
            Image.open(src).save(out / src.name, optimize=True)
            print("copied", src.name)


if __name__ == "__main__":
    main()
