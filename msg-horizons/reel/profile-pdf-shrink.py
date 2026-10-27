"""Shrinks the deck PDFs for email: Chrome embeds every photo losslessly, so each opaque colour image is re-encoded as
JPEG (quality 82). Transparency masks and small images are left as they are.
    python3 reel/profile-pdf-shrink.py public/media/profile/MSG-Horizons-Company-Profile-EN.pdf ...
"""
import io
import sys

import pikepdf
from PIL import Image

for path in sys.argv[1:]:
    pdf = pikepdf.open(path, allow_overwriting_input=True)
    for page in pdf.pages:
        for _, raw in page.images.items():
            if raw.get("/Filter") == "/DCTDecode" or int(raw.get("/Width", 0)) * int(raw.get("/Height", 0)) < 200_000:
                continue
            try:
                im = pikepdf.PdfImage(raw).as_pil_image()
            except Exception:
                continue
            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=82, optimize=True, progressive=True)
            raw.write(buf.getvalue(), filter=pikepdf.Name.DCTDecode)
            raw.ColorSpace = pikepdf.Name.DeviceRGB if im.mode == "RGB" else pikepdf.Name.DeviceGray
            raw.BitsPerComponent = 8
            for key in ("/DecodeParms", "/Predictor"):
                if key in raw:
                    del raw[key]
    pdf.save(path, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
    print("shrank", path)
