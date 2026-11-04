"""Coloca no site os logos escolhidos, um a um, entre os baixados por scripts/buscar_logos.mjs.

O desenho não muda: só tira a margem vazia e reduz o arquivo. Cada escolha foi conferida a olho, em folha de contato.
Quando a olimpíada não tem logo próprio publicado, vale o da organização (exemplo: NOIC, SBQ), sempre com fonte em data/logos-fontes.json.
Rodar da raiz: python scripts/aplicar_logos.py (requer pillow). Regenera src/lib/logos.ts a partir de public/olimpiadas/.
"""
import json
from pathlib import Path

from PIL import Image, ImageChops

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "materiais" / "logos-web"
DESTINO = RAIZ / "public" / "olimpiadas"

ESCOLHA = {
    "afs-global-stem-academies": 2, "apho": 0, "apmo": 0, "beamline-for-schools": 1, "bebras": 0, "blue-planet-awareness": 0,
    "breakthrough-junior-challenge": 1, "camaleao-quimica": 0, "cbr": 1, "concurso-cartas": 0, "concurso-cartas-upu": 0,
    "conrad-challenge": 1, "dialogos-brazil-conference": 0, "diamond-challenge": 0, "earth-prize": 3, "egmo": 2, "egoi": 0,
    "eupho": 0, "fao-concurso-cartazes": 1, "gks-graduacao": 0, "ibo": 0, "imcho": 3, "imo": 0, "ioaa": 0, "ioi": 2,
    "iypt-brasil": 1, "jacob-palis-jr": 0, "jovem-senador": 3, "ligmat": 3, "maratona-tech": 0, "mext-graduacao": 0,
    "mostratec": 0, "nasa-space-apps": 0, "nuca-unicef": 0, "obbiotec": 0, "obc-cidadania": 0, "obc-ciencias": 0,
    "obe-empreendedorismo": 3, "obecon": 0, "obef": 0, "obf": 2, "obho": 0, "obict": 0, "obmed": 0, "obn": 0,
    "oboa": 2, "oboart": 2, "obob": 0, "oboc": 2, "oboch": 0, "oboecon": 2, "obof": 2, "obofe": 0, "obofog": 2, "oboi": 2,
    "oboia": 0, "obol": 3, "obom": 0, "oboq": 3, "obor": 0, "obq": 0, "obqjr": 0, "obs-saber": 0, "obs-sociologia": 0,
    "obsat": 0, "ocf": 1, "oiab": 0, "oiaf": 0, "oiaq": 0, "oii": 0, "olaa": 0, "olimpiada-da-coruja": 0,
    "olimpiada-de-ingles": 0, "olimpiada-de-sustentabilidade": 0, "olimpiada-do-bem-publico": 0, "olimpiada-itabirana": 0,
    "olimpiada-mirim": 0, "omerj": 0, "ona": 0, "ong-globalizacao": 0, "onneq": 0, "onsc": 0, "op-be-a-ba": 0,
    "prep-estudar-fora": 0, "regeneron-isef": 1, "rise-for-the-world": 2, "stockholm-junior-water-prize": 3, "tbr": 0,
    "technovation": 0, "tfc": 2, "the-big-challenge": 1, "titas-da-matematica": 0, "tjr": 1, "tm2": 0,
    "turkiye-burslari-graduacao": 0, "tvq": 1, "uwc-brasil": 0, "vitalis": 0, "yale-young-global-scholars": 2,
}

man = {r["id"]: r for r in json.load(open(BASE / "manifesto2.json", encoding="utf-8"))}
fontes_p = RAIZ / "data" / "logos-fontes.json"
fontes = json.load(open(fontes_p, encoding="utf-8")) if fontes_p.exists() else {}
# Logos com partes claras que a detecção automática não pega, conferidos a olho.
escuras = {"oimc", "conrad-challenge", "olimpiada-itabirana", "stockholm-junior-water-prize"}
faltou = []


def aparar(im):
    """Tira só a margem vazia ou branca em volta."""
    fundo = Image.new("RGBA", im.size, (255, 255, 255, 255))
    fundo.alpha_composite(im)
    dif = ImageChops.difference(fundo.convert("RGB"), Image.new("RGB", im.size, "white")).convert("L").point(lambda v: 255 if v > 14 else 0)
    caixa = dif.getbbox()
    alfa = im.split()[3].point(lambda v: 255 if v > 20 else 0).getbbox()
    if caixa is None or (alfa and (alfa[2] - alfa[0]) * (alfa[3] - alfa[1]) > (caixa[2] - caixa[0]) * (caixa[3] - caixa[1]) * 1.3):
        caixa = alfa  # logo claro sobre transparente: a diferença para o branco não enxerga o desenho
    return im.crop(caixa) if caixa else im


def claro_demais(im):
    """Logo branco sobre transparente sumiria na placa branca: vai para a placa escura."""
    a = im.split()[3]
    pontos = list(im.convert("L").resize((64, 64)).getdata())
    alfas = list(a.resize((64, 64)).getdata())
    visiveis = [p for p, x in zip(pontos, alfas) if x > 128]
    if not visiveis or len(visiveis) > 64 * 64 * 0.92:
        return False
    return sum(visiveis) / len(visiveis) > 205


for id_, n in ESCOLHA.items():
    c = next((c for c in man.get(id_, {}).get("validos", []) if c["arquivo"].split("__")[1].split(".")[0] == str(n)), None)
    if not c:
        faltou.append(id_)
        continue
    im = aparar(Image.open(BASE / "norm" / c["norm"]).convert("RGBA"))
    if claro_demais(im):
        escuras.add(id_)
    im.thumbnail((320, 320), Image.LANCZOS)
    im.save(DESTINO / f"{id_}.webp", quality=82, method=6)
    fontes[id_] = {"url": c["url"], "origem": c["origem"]}

# Achados à mão no navegador, onde a busca automática foi bloqueada.
EXTRAS = {"ipho": ("ipho__9.png", "https://www.ipho-new.org/physics/wp-content/uploads/2019/07/IPHO.png"), "rotary-youth-exchange": ("rotary-youth-exchange__9.png", "https://www.rotary.org/get-involved/youth-programs/rotary-youth-exchange")}
for id_, (arq, url) in EXTRAS.items():
    p = BASE / arq
    if p.exists():
        im = aparar(Image.open(p).convert("RGBA"))
        if claro_demais(im):
            escuras.add(id_)
        im.thumbnail((320, 320), Image.LANCZOS)
        im.save(DESTINO / f"{id_}.webp", quality=82, method=6)
        fontes[id_] = {"url": url, "origem": "navegador"}

json.dump(dict(sorted(fontes.items())), open(fontes_p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
ids = sorted(p.stem for p in DESTINO.glob("*.webp"))
(RAIZ / "src" / "lib" / "logos.ts").write_text(
    "// Gerado por scripts/extrair_logos.py e scripts/aplicar_logos.py. Logos oficiais, sem alteração do desenho. Fontes em data/logos-fontes.json.\n"
    f"export const COM_LOGO = new Set<string>({json.dumps(ids)});\n"
    "// Logos claros, que somem na placa branca.\n"
    f"export const PLACA_ESCURA = new Set<string>({json.dumps(sorted(escuras))});\n",
    encoding="utf-8",
)
print(len(ESCOLHA) - len(faltou), "aplicados; total com logo", len(ids), "; placa escura:", sorted(escuras), "; faltou:", faltou)
