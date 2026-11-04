"""Recorta os dois estudantes do logo JOC em camadas, para animar a própria ilustração oficial.

Nada é redesenhado: rosto, cabelo, óculos, jaleco, luvas e objetos vêm do PNG original.
O logo corta os dois nas laterais do quadro central. Só essa parte do jaleco é completada, com o mesmo branco.

Rodar da raiz: python scripts/recortar_mascotes.py (requer pillow; o PNG fica em materiais/logos/).
Saída: public/joc/boneco/*.webp e src/lib/bonecos.ts. Coordenadas na escala do PNG (3108 px de largura).
"""
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "public" / "joc" / "boneco"
SAIDA.mkdir(parents=True, exist_ok=True)
ESCALA = 0.5
BRANCO = (255, 255, 255, 255)
TRACO = (95, 95, 95, 255)

logo = Image.open(RAIZ / "materiais" / "logos" / "Logo_JOC_laranja.png").convert("RGBA")


def mascara(tamanho, pontos, desloca=(0, 0), suave=1.2):
    m = Image.new("L", tamanho, 0)
    ImageDraw.Draw(m).polygon([(x - desloca[0], y - desloca[1]) for x, y in pontos], fill=255)
    return m.filter(ImageFilter.GaussianBlur(suave))


def arredondar(m, raio):
    return m.filter(ImageFilter.GaussianBlur(raio)).point(lambda v: 255 if v > 127 else 0).filter(ImageFilter.GaussianBlur(1.2))


def tirar(im, m):
    r, g, b, a = im.split()
    return Image.merge("RGBA", (r, g, b, ImageChops.subtract(a, m)))


def manter(im, m):
    r, g, b, a = im.split()
    return Image.merge("RGBA", (r, g, b, ImageChops.multiply(a, m)))


def contorno(im, raio=27):
    """Refaz o contorno branco de adesivo em volta do que sobrou, depois de tirar um objeto da mão."""
    a = im.split()[3].point(lambda v: 255 if v > 90 else 0)
    p = a.resize((a.width // 3, a.height // 3), Image.BILINEAR).filter(ImageFilter.GaussianBlur(raio / 4))
    p = p.point(lambda v: 255 if v > 30 else 0).resize(a.size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.5))
    base = Image.new("RGBA", im.size, (255, 255, 255, 0))
    base.putalpha(p)
    base.alpha_composite(im)
    return base


def salvar(im, nome, origem):
    caixa = im.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
    c = im.crop(caixa)
    c = c.resize((max(1, round(c.width * ESCALA)), max(1, round(c.height * ESCALA))), Image.LANCZOS)
    c.save(SAIDA / f"{nome}.webp", quality=84, method=6)
    return {"x": caixa[0] + origem[0], "y": caixa[1] + origem[1], "w": caixa[2] - caixa[0], "h": caixa[3] - caixa[1], "kb": round((SAIDA / f"{nome}.webp").stat().st_size / 1024, 1)}


def com_recuo(pontos, dy):
    return [(x, y - dy) for x, y in pontos]


saida = {}

# ---------------------------------------------------------------- menino
X0, X1, Y1 = 0, 980, 1490
art = logo.crop((X0, 0, X1, Y1))
tam = art.size
# Tudo à direita de x=880 é o quadro central do logo.
art = manter(art, mascara(tam, [(0, 0), (868, 0), (868, 560), (880, 600), (880, Y1), (0, Y1)], suave=0))
# Completa só a lateral do jaleco que o quadro escondia.
compl = Image.new("RGBA", tam, (0, 0, 0, 0))
forma = arredondar(mascara(tam, [(780, 560), (850, 560), (905, 640), (940, 800), (950, 1050), (935, 1300), (910, 1440), (860, 1472), (780, 1472)]), 18)
compl.paste(BRANCO, (0, 0), forma)
d = ImageDraw.Draw(compl)
d.line([(878, 600), (906, 800), (916, 1050), (902, 1300), (880, 1420)], fill=(226, 226, 226, 255), width=3, joint="curve")
compl.alpha_composite(art)
art = compl

CABECA = [(330, -5), (880, -5), (880, 500), (770, 505), (662, 482), (648, 438), (620, 436), (566, 462), (506, 452), (450, 430), (405, 405), (375, 425), (330, 400)]
BRACO = [(0, 60), (270, 60), (325, 345), (250, 415), (215, 400), (200, 435), (170, 468), (150, 480), (130, 522), (100, 556), (68, 568), (62, 522), (30, 512), (0, 500)]
BRACO_BASE = [(0, 60), (270, 60), (325, 345), (250, 415), (215, 400), (200, 435), (165, 462), (130, 482), (100, 500), (60, 500), (30, 490), (0, 480)]
# Tubo de ensaio: o que sai da luva, nas duas pontas.
TUBO = [[(112, 80), (250, 80), (250, 228), (218, 206), (206, 198), (128, 198), (112, 178)], [(198, 234), (300, 234), (300, 400), (190, 400), (180, 340), (178, 292)]]

cabeca = manter(art, mascara(tam, CABECA))
braco = manter(art, mascara(tam, BRACO))
livre = braco.copy()
for t in TUBO:
    livre = tirar(livre, mascara(tam, t))
livre = contorno(livre)
corpo = tirar(art, mascara(tam, com_recuo(CABECA, 32)))
corpo = tirar(corpo, mascara(tam, BRACO_BASE))

saida["menino"] = {
    "caixa": [0, 0, 960, 1490],
    "cabecaPivo": [585, 470],
    "bracoPivo": [90, 560],
    "camadas": {n: salvar(i, f"menino-{n}", (X0, 0)) for n, i in {"corpo": corpo, "cabeca": cabeca, "braco": braco, "livre": livre}.items()},
    "olhos": [[465, 288, 13, 14], [537, 313, 14, 14]],
    "boca": [512, 392, 20, 11, -8],
    "pele": "#%02x%02x%02x" % logo.getpixel((470, 345))[:3],
    "maoPivo": [170, 225],
}

# ---------------------------------------------------------------- menina
X0, X1, Y1 = 2100, 3108, 1490
art = logo.crop((X0, 0, X1, Y1))
tam = art.size
loc = lambda pts: [(x - X0, y) for x, y in pts]
# Tudo à esquerda de x=2216 é o quadro central do logo.
art = manter(art, mascara(tam, loc([(2216, 0), (3108, 0), (3108, Y1), (2216, Y1)]), suave=0))
compl = Image.new("RGBA", tam, (0, 0, 0, 0))
forma = arredondar(mascara(tam, loc([(2300, 405), (2216, 405), (2176, 470), (2132, 620), (2106, 850), (2106, 1120), (2130, 1350), (2165, 1438), (2216, 1462), (2300, 1470)])), 18)
compl.paste(BRANCO, (0, 0), forma)
d = ImageDraw.Draw(compl)
d.polygon(loc([(2230, 436), (2196, 478), (2230, 478)]), fill=(246, 137, 53, 255))
for linha in [[(2220, 833), (2182, 808)], [(2220, 1040), (2168, 1085)], [(2220, 1162), (2172, 1154), (2174, 1176), (2220, 1183)]]:
    d.line(loc(linha), fill=TRACO, width=4, joint="curve")
compl.alpha_composite(art)
art = compl

CABECA = loc([(2190, -5), (3000, -5), (3000, 340), (2800, 385), (2710, 405), (2660, 425), (2570, 445), (2495, 405), (2450, 338), (2405, 325), (2300, 320), (2190, 350)])
# Coordenadas da mão com o tubo, na escala do PNG.
BRACO = [(2762, 530), (2790, 512), (2790, 462), (2870, 462), (2890, 515), (3005, 550), (3082, 695), (3092, 800), (3072, 815), (3075, 882), (3000, 884), (2945, 830), (2935, 797), (2912, 752), (2877, 757), (2830, 762), (2800, 700), (2775, 625), (2762, 600)]
BRACO_L = loc(BRACO)
TUBO = [loc([(2750, 500), (2860, 500), (2848, 548), (2815, 556), (2790, 585), (2762, 610), (2750, 600)]), loc([(2775, 640), (2842, 622), (2850, 660), (2885, 715), (2905, 748), (2870, 770), (2826, 770), (2790, 700)])]

cabeca = manter(art, mascara(tam, CABECA))
braco = manter(art, mascara(tam, BRACO_L))
livre = braco.copy()
for t in TUBO:
    livre = tirar(livre, mascara(tam, t))
livre = contorno(livre)
corpo = tirar(art, mascara(tam, com_recuo(CABECA, 32)))
# O corpo fica sem a mão. O que estava atrás dela (cabelo e contorno) é preenchido para não abrir buraco quando ela se mexe.
corpo = tirar(corpo, mascara(tam, loc([(2762, 530), (2790, 512), (2790, 462), (2870, 462), (2890, 515), (3005, 550), (3082, 695), (3092, 790), (2950, 790), (2912, 752), (2877, 757), (2830, 762), (2800, 700), (2775, 625), (2762, 600)])))
atras = Image.new("RGBA", tam, (0, 0, 0, 0))
d = ImageDraw.Draw(atras)
d.polygon(loc([(2775, 470), (2840, 490), (2850, 640), (2865, 755), (2805, 720), (2790, 560)]), fill=BRANCO)
d.polygon(loc([(2850, 690), (2940, 735), (2950, 805), (2875, 835), (2825, 755)]), fill=BRANCO)
d.polygon(loc([(2755, 470), (2772, 470), (2790, 560), (2808, 690), (2800, 722), (2750, 620)]), fill=logo.getpixel((2740, 520)))
atras.alpha_composite(corpo)
corpo = atras

saida["menina"] = {
    "caixa": [2100, 0, 990, 1490],
    "cabecaPivo": [2500, 420],
    "bracoPivo": [2985, 875],
    "camadas": {n: salvar(i, f"menina-{n}", (X0, 0)) for n, i in {"corpo": corpo, "cabeca": cabeca, "braco": braco, "livre": livre}.items()},
    "olhos": [[2580, 295, 14, 18], [2655, 316, 14, 17]],
    "boca": [2577, 382, 17, 9, 10],
    "pele": "#%02x%02x%02x" % logo.getpixel((2600, 360))[:3],
    "maoPivo": [2830, 610],
}

(RAIZ / "src" / "lib" / "bonecos.ts").write_text(
    "// Gerado por scripts/recortar_mascotes.py. Camadas da ilustração oficial do logo JOC, em coordenadas do PNG original.\n"
    f"export const BONECOS = {json.dumps(saida, ensure_ascii=False, indent=2)} as const;\n",
    encoding="utf-8",
)
print(json.dumps({q: {k: v["kb"] for k, v in s["camadas"].items()} for q, s in saida.items()}), saida["menino"]["pele"], saida["menina"]["pele"])
