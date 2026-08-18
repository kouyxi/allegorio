#!/usr/bin/env python3
"""Inline design/img/*.jpg into a sketch template as data URIs.

Artifacts run under a CSP that blocks every host except Google Fonts, so
images have to travel inside the file. Placeholders:

    {{name}}    -> img/name.jpg
    {{t:name}}  -> img/thumb/name.jpg

Usage: python3 build.py sketch-05.template.html sketch-05.html
"""
import base64
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent


def uri(path: pathlib.Path) -> str:
    return "data:image/jpeg;base64," + base64.b64encode(path.read_bytes()).decode()


def main(src: str, dst: str) -> None:
    html = (HERE / src).read_text(encoding="utf-8")
    cache: dict[str, str] = {}

    def sub(m: re.Match[str]) -> str:
        key = m.group(1)
        if key not in cache:
            name = key[2:] if key.startswith("t:") else key
            sub_dir = "img/thumb" if key.startswith("t:") else "img"
            path = HERE / sub_dir / f"{name}.jpg"
            if not path.exists():
                raise SystemExit(f"missing image: {path}")
            cache[key] = uri(path)
        return cache[key]

    html = re.sub(r"\{\{([a-z0-9:-]+)\}\}", sub, html)

    leftover = re.findall(r"\{\{.*?\}\}", html)
    if leftover:
        raise SystemExit(f"unresolved placeholders: {leftover}")

    (HERE / dst).write_text(html, encoding="utf-8")
    size = len(html.encode()) / 1024 / 1024
    print(f"{dst}: {size:.2f} MB, {len(cache)} images inlined")


if __name__ == "__main__":
    main(*sys.argv[1:3])
