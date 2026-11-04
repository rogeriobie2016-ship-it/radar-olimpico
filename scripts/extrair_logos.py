"""Extrai os logos oficiais das olimpíadas dos PDFs, sem alterar nada, e recorta as peças do logo JOC.

Rodar da raiz: python scripts/extrair_logos.py (requer pymupdf e pillow; os PDFs ficam em materiais/).
Saída: public/olimpiadas/<id>.webp, public/joc/*.webp e src/lib/logos.ts.
"""
import io
import re
from pathlib import Path

import pymupdf
from PIL import Image, ImageChops, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
DOCS = RAIZ / "materiais" / "docs"
LOGOS = RAIZ / "materiais" / "logos"
SAIDA = RAIZ / "public" / "olimpiadas"
SAIDA.mkdir(parents=True, exist_ok=True)
(RAIZ / "public" / "joc").mkdir(parents=True, exist_ok=True)

# Mesmo mapa de páginas de extrair_dados.py
fonte = (RAIZ / "scripts" / "extrair_dados.py").read_text(encoding="utf-8")
PAGINAS = {int(p): i for p, i in re.findall(r'^\s+(\d+): \("([a-z0-9-]+)",', fonte, re.M)}

catalogo = pymupdf.open(DOCS / "Catalogo de Olimpiadas 2026.pdf")


def guardar(im, nome, lado=320):
    im = im.convert("RGBA")
    im.thumbnail((lado, lado), Image.LANCZOS)
    im.save(SAIDA / f"{nome}.webp", quality=80, method=6)


def aparar(im):
    """Tira só a margem vazia em volta. O desenho do logo não muda."""
    rgba = im.convert("RGBA")
    fundo = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    fundo.alpha_composite(rgba)
    dif = ImageChops.difference(fundo.convert("RGB"), Image.new("RGB", rgba.size, (255, 255, 255))).convert("L").point(lambda v: 255 if v > 14 else 0)
    caixa = dif.getbbox()
    return rgba.crop(caixa) if caixa else rgba


feitos = {}
for pag, id_ in PAGINAS.items():
    p = catalogo[pag - 1]
    # O logo é a imagem no topo da ficha. As demais são rodapé e fundo.
    candidatos = []
    for info in p.get_images(full=True):
        rects = p.get_image_rects(info[0])
        if rects and rects[0].y0 < 260 and rects[0].width < 560:
            candidatos.append((rects[0].width * rects[0].height, info[0]))
    if not candidatos:
        print("sem imagem:", pag, id_)
        continue
    xref = max(candidatos)[1]
    pix = pymupdf.Pixmap(catalogo, xref)
    smask = catalogo.extract_image(xref).get("smask") or 0
    if smask:
        pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(catalogo, smask))
    elif pix.colorspace and pix.colorspace.n > 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    im = Image.open(io.BytesIO(pix.tobytes("png")))
    guardar(aparar(im), id_)
    feitos[id_] = f"Catálogo, p. {pag}"

# Só nos Radars: o logo é recortado do cartão branco, acima da linha "Inscrições".
SET = "SETEMBRO - Olimpiadas e eventos cientificos com inscricoes abertas.pdf"
JUL = "COPES - Radar Olimpico - Julho.pdf"
RADARES = {"obgp": (SET, 5), "obli": (SET, 8), "oscear": (SET, 2), "cf-obi": (SET, 4), "onee": (SET, 6), "one": (SET, 9), "geoinformacao": (JUL, 2), "ia-aplicada": (JUL, 4), "obbs": (JUL, 5)}
for id_, (arq, pag) in RADARES.items():
    d = pymupdf.open(DOCS / arq)
    p = d[pag - 1]
    ins = p.search_for("Inscrições")[0]
    clip = pymupdf.Rect(105, 300, p.rect.width - 105, ins.y0 - 2)
    px = p.get_pixmap(dpi=220, clip=clip)
    im = Image.frombytes("RGB", (px.width, px.height), px.samples)
    guardar(aparar(im), id_)
    feitos[id_] = f"{arq[:8]}, p. {pag}"

# Evento da SEDUC: logo oficial do Ceará Científico.
guardar(aparar(Image.open(LOGOS / "LogoCearaCientifico.png")), "ceara-cientifico", 420)
feitos["ceara-cientifico"] = "Logos Oficiais"

# Peças do logo JOC. Coordenadas na escala de 2000 px de largura.
joc = Image.open(LOGOS / "Logo_JOC_laranja.png").convert("RGBA")
k = joc.width / 2000


def recortar(nome, caixa, largura):
    x0, y0, x1, y1 = [round(v * k) for v in caixa]
    c = joc.crop((x0, y0, x1, y1))
    c.thumbnail((largura, largura * 3), Image.LANCZOS)
    c.save(RAIZ / "public" / "joc" / f"{nome}.webp", quality=90, method=6)


COL = [(590, 856), (864, 1130), (1137, 1403)]
LIN = [(115, 381), (388, 654), (662, 928)]
for li, (y0, y1) in enumerate(LIN):
    for co, (x0, x1) in enumerate(COL):
        recortar(f"t{li}{co}", (x0, y0, x1, y1), 300)
recortar("menino", (0, 0, 570, 945), 460)
recortar("menina", (1425, 0, 2000, 945), 460)
joc2 = joc.copy()
joc2.thumbnail((560, 560), Image.LANCZOS)
joc2.save(RAIZ / "public" / "joc" / "logo.webp", quality=90, method=6)

ids = sorted(feitos)
linhas = ", ".join(f'"{i}"' for i in ids)
(RAIZ / "src" / "lib" / "logos.ts").write_text(
    "// Gerado por scripts/extrair_logos.py. Logos oficiais, extraídos sem alteração dos PDFs da COPES.\n"
    f"export const COM_LOGO = new Set<string>([{linhas}]);\n",
    encoding="utf-8",
)
print(len(ids), "logos")

# Folha de conferência, fora do site.
fs = sorted(SAIDA.glob("*.webp"))
col = 9
L = 190
folha = Image.new("RGB", (col * L, ((len(fs) + col - 1) // col) * 120), "#dddddd")
dr = ImageDraw.Draw(folha)
for n, f in enumerate(fs):
    im = Image.open(f).convert("RGBA")
    im.thumbnail((170, 90))
    x, y = (n % col) * L + 8, (n // col) * 120 + 4
    folha.paste(im, (x, y), im)
    dr.text((x, y + 94), f.stem, fill="black")
folha.save(RAIZ / "materiais" / "folha_logos.jpg", quality=85)
