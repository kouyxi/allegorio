#!/usr/bin/env python3
"""Gera os arquivos de favicon a partir da mesma geometria do VaultSeal.

O selo do site usa 3 anéis e 16 caixotões. Essa densidade vira borrão a 16px,
que é o tamanho em que um favicon realmente é visto, então a marca de aba usa
uma variação mais aberta: menos caixotões, vãos proporcionalmente maiores e
raio interno alto. É o mesmo desenho, contado com menos peças.

Uso:
    python3 scripts/gera-favicon.py

Precisa de rsvg-convert e ImageMagick no PATH. Saída em public/.
"""
from __future__ import annotations

import math
import pathlib
import subprocess

W = 200.0
R_OUT = 92.0

PAPER = "#efede6"
INK = "#0e0e0c"

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "public"


def caixotoes(aneis: int, n: int, raio_interno: float, gap: float, inset: float) -> list[str]:
    """Mesma construção de VaultSeal.vue: anéis em progressão geométrica."""
    passo = math.tau / n
    fora: list[str] = []

    def p(r: float, a: float) -> str:
        return f"{W / 2 + r * math.cos(a):.2f} {W / 2 + r * math.sin(a):.2f}"

    for anel in range(aneis):
        razao = R_OUT / raio_interno
        r0 = raio_interno * razao ** (anel / aneis) + inset
        r1 = raio_interno * razao ** ((anel + 1) / aneis) - inset

        for s in range(n):
            g0 = (gap / 2 + inset) / r0
            g1 = (gap / 2 + inset) / r1
            a0 = s * passo
            a1 = (s + 1) * passo
            fora.append(
                f"M{p(r1, a0 + g1)}A{r1:.2f} {r1:.2f} 0 0 1 {p(r1, a1 - g1)}"
                f"L{p(r0, a1 - g0)}A{r0:.2f} {r0:.2f} 0 0 0 {p(r0, a0 + g0)}Z"
            )

    return fora


def svg(paths: list[str], fundo: bool = True) -> str:
    """O favicon leva o papel junto: sem fundo, a marca some em aba clara.

    A regra de esquema escuro inverte os dois valores, então a aba escura
    recebe o selo em papel sobre tinta, que é a mesma dupla do site.
    """
    corpo = "\n  ".join(f'<path d="{d}"/>' for d in paths)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <style>
    .fundo {{ fill: {PAPER if fundo else "none"}; }}
    .selo {{ fill: {INK}; }}
    @media (prefers-color-scheme: dark) {{
      .fundo {{ fill: {INK if fundo else "none"}; }}
      .selo {{ fill: {PAPER}; }}
    }}
  </style>
  <rect class="fundo" width="200" height="200"/>
  <g class="selo">
  {corpo}
  </g>
</svg>
"""


# A variação de aba: 2 anéis, 10 caixotões. Escolhida comparando A/B a 16px
# contra 3x16, 3x12, 2x12, 2x8 e 1x10. Com mais caixotões vira cinza borrado;
# com um anel só some a estrutura concêntrica, que é o que identifica o selo.
# O raio interno fica perto do canônico (36) para a massa aguentar 16px.
FAVICON = dict(aneis=2, n=10, raio_interno=38.0, gap=7.0, inset=4.0)


def main() -> None:
    SAIDA.mkdir(exist_ok=True)
    paths = caixotoes(**FAVICON)

    alvo = SAIDA / "favicon.svg"
    alvo.write_text(svg(paths))

    # PNGs para quem não lê favicon em SVG, e o ícone de tela de início
    for nome, px in (("favicon-32.png", 32), ("favicon-180.png", 180)):
        subprocess.run(
            ["rsvg-convert", str(alvo), "-w", str(px), "-h", str(px), "-o", str(SAIDA / nome)],
            check=True,
        )

    # .ico com os dois tamanhos que o Windows e alguns leitores ainda pedem
    subprocess.run(["rsvg-convert", str(alvo), "-w", "16", "-h", "16", "-o", "/tmp/fav16.png"], check=True)
    subprocess.run(
        ["magick", "/tmp/fav16.png", str(SAIDA / "favicon-32.png"), str(SAIDA / "favicon.ico")],
        check=True,
    )

    print(f"gerado: {alvo.name}, favicon-32.png, favicon-180.png, favicon.ico")


if __name__ == "__main__":
    main()
