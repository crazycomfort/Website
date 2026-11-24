#!/usr/bin/env python3
"""Internal link check for the static site. Honors _redirects."""
import re
import sys
from pathlib import Path
from urllib.parse import unquote

root = Path(__file__).resolve().parents[1]
redirects = {}
redir_file = root / "_redirects"
if redir_file.exists():
    for line in redir_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) >= 2:
            src = parts[0].split("?")[0]
            if not src.endswith("/"):
                src += "/"
            redirects[src] = parts[1]

href_re = re.compile(r'''(?:href|src)\s*=\s*['"]([^'"]+)['"]''', re.I)
missing = []
checked = 0
for page in root.rglob("*.html"):
    if "node_modules" in page.parts:
        continue
    text = page.read_text(errors="ignore")
    for url in href_re.findall(text):
        if url.startswith(("http://", "https://", "mailto:", "tel:", "sms:", "#", "data:", "javascript:")):
            continue
        path = unquote(url.split("#", 1)[0].split("?", 1)[0])
        if not path:
            continue
        checked += 1
        if not path.startswith("/"):
            path = "/" + str((page.parent / path).resolve().relative_to(root))
        if path != "/" and path.endswith("/"):
            candidates = [root / path.lstrip("/") / "index.html", root / path.lstrip("/")]
        elif path == "/":
            candidates = [root / "index.html"]
        else:
            candidates = [root / path.lstrip("/"), root / path.lstrip("/") / "index.html"]
        key = path if path.endswith("/") else path + "/"
        if key in redirects or path in redirects:
            continue
        if any(c.exists() for c in candidates):
            continue
        missing.append(f"{page.relative_to(root)} -> {url}")

print(f"checked {checked} internal links")
print(f"missing {len(missing)}")
for row in missing[:80]:
    print(row)
sys.exit(1 if missing else 0)
