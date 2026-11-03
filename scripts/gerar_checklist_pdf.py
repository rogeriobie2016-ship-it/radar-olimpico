"""Gera public/docs/checklist-joc-2026.pdf a partir de data/joc.json.
Rodar quando as regras mudarem: python scripts/gerar_checklist_pdf.py (requer pymupdf)."""
import json
from pathlib import Path
import pymupdf

RAIZ = Path(__file__).resolve().parent.parent
J = json.loads((RAIZ / "data" / "joc.json").read_text(encoding="utf-8"))

doc = pymupdf.open()
pag = doc.new_page(width=595, height=842)
LARANJA, TINTA, CINZA = (0.96, 0.54, 0.2), (0.14, 0.09, 0.05), (0.4, 0.34, 0.29)
y = [50]


def nova_se_preciso(alt):
    global pag
    if y[0] + alt > 800:
        pag = doc.new_page(width=595, height=842)
        y[0] = 50


def escrever(texto, tam=10.5, x=50, cor=TINTA, neg=False, largura=495):
    fonte = "hebo" if neg else "helv"
    alt = 14 + tam * 1.35 * max(1, (pymupdf.get_text_length(texto, fontname=fonte, fontsize=tam) // largura))
    nova_se_preciso(alt)
    pag.insert_textbox(pymupdf.Rect(x, y[0], x + largura, y[0] + alt + 12), texto, fontsize=tam, fontname=fonte, color=cor)
    y[0] += alt - 4


def titulo(t):
    y[0] += 10
    nova_se_preciso(40)
    pag.draw_rect(pymupdf.Rect(50, y[0], 56, y[0] + 15), color=LARANJA, fill=LARANJA)
    escrever(t, 13, 62, neg=True, largura=480)


def caixa(t):
    nova_se_preciso(30)
    pag.draw_rect(pymupdf.Rect(52, y[0] + 1, 63, y[0] + 12), color=TINTA, width=0.9)
    escrever(t, 10.5, 72, largura=470)


escrever("Checklist de documentos: financiamento JOC 2026", 18, neg=True)
escrever("Juventude Olímpica do Conhecimento | SEDUC Ceará | COPES", 10, cor=CINZA)
escrever("Evento: ______________________________   Data: ____/____/______   Nível: ______________", 10.5)
titulo("Documentos da escola")
for d in J["documentosEscola"]:
    caixa(d)
titulo("Documentos de cada participante (1 professor e até 3 estudantes)")
for d in J["documentosParticipante"]:
    caixa(d)
titulo("Prazo mínimo para abrir o processo, antes do evento")
P = J["prazosDias"]
escrever(f"Regional e estadual: {P['estadual']} dias corridos.  Nacional: {P['nacional']} dias.  Internacional: {P['internacional']} dias.")
escrever(f"Boleto de inscrição: pelo menos {J['prazoBoletoDias']} dias entre a chegada do processo à COPES e o vencimento.")
titulo("Caminho do processo")
for f in J["fluxo"]:
    escrever(f"{f['quem']}: {f['oQue']}")
titulo("Depois do evento (prestação de contas)")
for d in J["posEvento"]:
    caixa(d)
y[0] += 8
escrever("Fonte: Regulamento JOC 2026. Formulários e anexos estão no próprio Regulamento. Em caso de dúvida, procure sua CREDE/SEFOR.", 9, cor=CINZA)
destino = RAIZ / "public" / "docs" / "checklist-joc-2026.pdf"
doc.save(destino, garbage=4, deflate=True)
print(destino.name, destino.stat().st_size, "bytes,", len(doc), "página(s)")
