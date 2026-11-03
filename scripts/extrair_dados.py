"""Extrai o Catálogo 2026 e os Radars de Julho e Setembro para data/oportunidades.json.

Uso único (carga inicial). A atualização mensal é feita à mão no JSON: ver README.
Requer: pip install pymupdf. Rodar da raiz do projeto: python scripts/extrair_dados.py

Regra: nada é inventado. O que o documento não diz fica nulo e entra em camposAConfirmar.
"""
import json
import re
from pathlib import Path

import pymupdf

RAIZ = Path(__file__).resolve().parent.parent
DOCS = RAIZ / "materiais" / "docs"
HOJE = "2026-11-03"

# Códigos de série usados nos filtros
EFI, EF6, EF7, EF8, EF9 = "EF-iniciais", "6EF", "7EF", "8EF", "9EF"
EM1, EM2, EM3, TEC, EJA = "1EM", "2EM", "3EM", "TEC", "EJA"
FINAIS = [EF6, EF7, EF8, EF9]
EM = [EM1, EM2, EM3]

LC, MAT, CN, CH = "Linguagens e Códigos", "Matemática", "Ciências da Natureza", "Ciências Humanas e Sociais Aplicadas"
TI, AMB, FIN, MULTI = "Tecnologia e Computação", "Meio Ambiente", "Educação Financeira e Gestão", "Multidisciplinar"

# página: (id, sigla, nome, tipo, nivel, areas, series, formato, organizador, modalidade)
FICHAS = {
    7: ("obl", "OBL", "Olimpíada Brasileira de Linguística", "olimpiada", "nacional", [LC], [EFI] + FINAIS + EM, "prova", None, None),
    8: ("olimpiada-de-literatura", "OL", "Olimpíada de Literatura", "olimpiada", "nacional", [LC], [], "prova", None, None),
    9: ("olimpiada-de-portugues", "OP", "Olimpíada de Português", "olimpiada", "nacional", [LC], FINAIS + EM, "prova", None, None),
    10: ("obli", "OBLI", "Olimpíada Brasileira de Língua Inglesa", "olimpiada", "nacional", [LC], [EFI] + FINAIS + EM + [TEC, EJA], "prova", None, None),
    11: ("ocef", "OCEF", "Olimpíada Cearense de Educação Física", "olimpiada", "estadual", [LC], FINAIS + EM + [TEC, EJA], "prova", "IFCE", None),
    13: ("mcem", "MCEM", "Maratona Cearense de Matemática", "olimpiada", "estadual", [MAT], EM + [EJA], "prova", "SEDUC Ceará e Fundação Demócrito Rocha", None),
    14: ("omifce", "OMIFCE", "Olimpíada de Matemática do IFCE", "olimpiada", "estadual", [MAT], [EF8, EF9] + EM + [TEC, EJA], "prova", "IFCE", None),
    15: ("gepemac", "GEPEMAC", "Olimpíada de Matemática GEPEMAC/IFCE", "olimpiada", "estadual", [MAT], EM, "prova", "GEPEMAC/IFCE", None),
    16: ("mandacaru", None, "Olimpíada Mandacaru de Matemática", "olimpiada", "nacional", [MAT], [EFI] + FINAIS + EM, "prova", None, None),
    17: ("obm", "OBM", "Olimpíada Brasileira de Matemática", "olimpiada", "nacional", [MAT], FINAIS + EM, "prova", "Associação da Olimpíada Brasileira de Matemática (AOBM)", None),
    18: ("obmep", "OBMEP", "Olimpíada Brasileira de Matemática das Escolas Públicas", "olimpiada", "nacional", [MAT], FINAIS + EM, "prova", "IMPA", None),
    19: ("oimsf", "OIMSF", "Olimpíada Internacional Matemática sem Fronteiras", "olimpiada", "internacional", [MAT], FINAIS + EM, "prova", None, None),
    20: ("obrl", "OBRL", "Olimpíada Brasileira de Raciocínio Lógico", "olimpiada", "nacional", [MAT], [EFI] + FINAIS + EM, "prova", None, None),
    21: ("canguru", None, "Olimpíada Canguru de Matemática", "olimpiada", "internacional", [MAT], [EFI] + FINAIS + EM, "prova", "Associação Canguru sem Fronteiras (AKSF)", None),
    22: ("obmf", "OBMF", "Olimpíada Brasileira de Matemática Financeira", "olimpiada", "nacional", [MAT, FIN], [EFI] + FINAIS + EM, "prova", None, None),
    23: ("oimc", "OIMC", "Olimpíada Internacional de Matemática e do Conhecimento", "olimpiada", "internacional", [MAT, MULTI], [EFI] + FINAIS + EM, "prova", "Instituto Alpha Lumen", None),
    24: ("omu", "OMU", "Olimpíada de Matemática da Unicamp", "olimpiada", "nacional", [MAT], FINAIS + EM, "prova", "Unicamp", "hibrida"),
    26: ("oqep", "OQEP", "Olimpíada de Química das Escolas Públicas", "olimpiada", "estadual", [CN], [EF9] + EM + [TEC, EJA], "prova", "IFCE", "online"),
    27: ("vanda", "VANDA", "International Science Competition (VANDA)", "olimpiada", "internacional", [CN], [EFI] + FINAIS + EM, "prova", None, None),
    28: ("ocq", "OCQ", "Olimpíada Cearense de Química", "olimpiada", "estadual", [CN], [EF9] + EM + [TEC], "prova", "UFC e IFCE", None),
    29: ("obsma", "OBSMA", "Olimpíada Brasileira de Saúde e Meio Ambiente", "olimpiada", "nacional", [CN, AMB], FINAIS + EM, "projeto", "Fiocruz", None),
    30: ("onc", "ONC", "Olimpíada Nacional de Ciências", "olimpiada", "nacional", [CN, MULTI], FINAIS + EM + [EJA], "prova", "UFPI e MCTI", None),
    31: ("obfep", "OBFEP", "Olimpíada Brasileira de Física das Escolas Públicas", "olimpiada", "nacional", [CN], FINAIS + EM + [EJA], "prova", None, None),
    32: ("oba", "OBA", "Olimpíada Brasileira de Astronomia e Astronáutica", "olimpiada", "nacional", [CN], [EFI] + FINAIS + EM, "prova", "Sociedade Astronômica Brasileira (SAB) e Agência Espacial Brasileira (AEB)", None),
    33: ("obafog", "OBAFOG", "Olimpíada Brasileira de Foguetes", "olimpiada", "nacional", [CN], [], "projeto", None, None),
    34: ("obb", "OBB", "Olimpíada Brasileira de Biologia", "olimpiada", "nacional", [CN], EM + [TEC], "prova", "Instituto Butantan", None),
    35: ("quimeninas", None, "Olimpíada Quimeninas", "olimpiada", "nacional", [CN], [EF9, EM1, EM2], "prova", None, None),
    36: ("ocerq", "OCERQ", "Olimpíada Cearense de Relatividade e Quântica", "olimpiada", "estadual", [CN], EM, "prova", None, None),
    38: ("obrac", "OBRAC", "Olimpíada Brasileira de Cartografia", "olimpiada", "nacional", [CH], [EF9] + EM, "prova", None, None),
    39: ("oche", "OCHE", "Olimpíada de Ciências Humanas do Estado do Ceará", "olimpiada", "estadual", [CH], [EF8, EF9] + EM + [TEC, EJA], "prova", "IFCE", None),
    40: ("onhb-a", "ONHB-A", "Olimpíada Nacional em História do Brasil Aberta para Todos", "olimpiada", "nacional", [CH], [], "prova", None, None),
    41: ("onhb", "ONHB", "Olimpíada Nacional em História do Brasil", "olimpiada", "nacional", [CH], FINAIS + EM, "prova", None, None),
    42: ("obg", "OBG", "Olimpíada Brasileira de Geografia", "olimpiada", "nacional", [CH], [EF8, EF9] + EM + [TEC, EJA], "prova", None, None),
    43: ("obgp", "OBGP", "Olimpíada Brasileira de Geopolítica", "olimpiada", "nacional", [CH], [EFI] + FINAIS + EM + [EJA], "prova", None, None),
    44: ("onfil", "ONFIL", "Olimpíada Nacional de Filosofia", "olimpiada", "nacional", [CH], EM, "projeto", None, None),
    45: ("obapo", "OBAPO", "Olimpíada Brasileira de Africanidades e Povos Originários", "olimpiada", "nacional", [CH], [EFI] + FINAIS + EM + [EJA], "prova", None, None),
    47: ("premio-criativos", None, "Prêmio Criativos Escola + Natureza", "programa", "nacional", [AMB], FINAIS + EM, "projeto", None, None),
    48: ("restaura-natureza", None, "Restaura Natureza: Olimpíada Brasileira de Restauração de Ecossistemas", "olimpiada", "nacional", [AMB], [EF7, EF8, EF9, EM1, EM2], "projeto", None, None),
    49: ("o2-oceano", "O2", "O2: Olimpíada Brasileira do Oceano", "olimpiada", "nacional", [AMB], [EFI] + FINAIS + EM + [TEC, EJA], "projeto", None, None),
    50: ("onad", "ONAD", "Olimpíada Nacional de Astronomia Digital", "olimpiada", "nacional", [CN, TI], [EFI] + FINAIS + EM + [TEC], "prova", None, "hibrida"),
    51: ("obt", "OBT", "Olimpíada Brasileira de Tecnologia", "olimpiada", "nacional", [TI], [EF8, EF9] + EM, "projeto", "Instituto Alpha Lumen e MIT Brazil", None),
    52: ("obr", "OBR", "Olimpíada Brasileira de Robótica", "olimpiada", "nacional", [TI], FINAIS + EM + [TEC], "projeto", None, None),
    53: ("onano", "ONANO", "Olimpíada Nacional de Nanotecnologia", "olimpiada", "nacional", [TI, CN], FINAIS + EM + [TEC], "prova", None, None),
    54: ("onda", "ONDA", "Olimpíada Nacional de Aplicativos", "olimpiada", "nacional", [TI], EM, "projeto", None, None),
    55: ("obi", "OBI", "Olimpíada Brasileira de Informática", "olimpiada", "nacional", [TI], FINAIS + EM + [TEC], "prova", "Sociedade Brasileira de Computação", None),
    56: ("oci", "OCI", "Olimpíada Cearense de Informática", "olimpiada", "estadual", [TI], FINAIS + EM, "prova", "PET Computação da UFC", None),
    57: ("onia", "ONIA", "Olimpíada Nacional de Inteligência Artificial", "olimpiada", "nacional", [TI], [EFI, EF6, EF7, EF8, EF9] + EM, "prova", None, None),
    58: ("obadm", "OBAdm", "Olimpíada Brasileira de Administração", "olimpiada", "nacional", [FIN], EM + [TEC, EJA], "prova", "Conselho Regional de Administração do Rio de Janeiro", None),
    59: ("olitef", "OLITEF", "Olimpíada do Tesouro Direto de Educação Financeira", "olimpiada", "nacional", [FIN], FINAIS + EM + [EJA], "prova", None, None),
    60: ("controle-social", None, "Olimpíada de Controle Social das Contas Públicas", "olimpiada", "estadual", [CH, FIN], EM, "prova", "TCE-CE, SEDUC Ceará e Instituto Plácido Castelo", None),
    61: ("obinvest", "OBINVEST", "Olimpíada Brasileira de Investimentos", "olimpiada", "nacional", [FIN], FINAIS + EM, "prova", "CEFET-RJ", None),
    63: ("fenecit", "FENECIT", "Feira Nordestina de Ciência e Tecnologia", "feira", "nacional", [MULTI], [EFI] + FINAIS + EM + [TEC], "projeto", "Instituto Princípio do Saber", "presencial"),
    64: ("tfm", "TFM", "Torneio de Física para Meninas", "olimpiada", "nacional", [CN], [EF8, EF9] + EM, "prova", None, None),
    65: ("tbc", "TBC", "Torneio Brasileiro de Ciências", "olimpiada", "nacional", [CN], [EFI] + FINAIS + EM + [TEC], "prova", None, None),
    66: ("tnbio", "TNBio", "Torneio Nacional de Biologia", "olimpiada", "nacional", [CN], [EFI] + FINAIS + EM + [TEC], "prova", None, None),
    67: ("milset-brasil", "MILSET", "MILSET Brasil", "feira", "nacional", [MULTI], [EFI] + FINAIS + EM + [TEC, EJA], "projeto", "Associação Movimento Pela Ciência e Aprendizagem do Brasil", None),
    68: ("febic", "FEBIC", "Feira Brasileira de Iniciação Científica", "feira", "nacional", [MULTI], [EFI] + FINAIS + EM + [TEC, EJA], "projeto", "Instituto Brasileiro de Iniciação Científica (IBIC)", None),
    69: ("febrace", "FEBRACE", "Feira Brasileira de Ciências e Engenharia", "feira", "nacional", [MULTI], [EF8, EF9] + EM + [TEC], "projeto", None, None),
    70: ("mocica", "MOCICA", "Mostra Científica do Cariri", "feira", "regional", [MULTI], [EFI] + FINAIS + EM + [TEC, EJA], "projeto", None, None),
    71: ("futuras-cientistas", None, "Futuras Cientistas", "programa", "nacional", [MULTI], [EM2], "projeto", "Centro de Tecnologias Estratégicas do Nordeste (Cetene)", None),
}

# Lista de olimpíadas aceitas no edital de ingresso da UFC (p. 72 a 77) que não têm ficha própria.
# (id, sigla, nome, link, nivel, areas). Link None: o catálogo diz que não há site oficial ativo.
SO_UFC = [
    ("apho", "APhO", "Asian Physics Olympiad", "http://asianphysicsolympiad.org/", "internacional", [CN], 72),
    ("apmo", "APMO", "Asian Pacific Mathematics Olympiad", "https://apmo-official.org/", "internacional", [MAT], 72),
    ("cf-obi", "CF-OBI", "Competição Feminina da Olimpíada Brasileira de Informática", "https://olimpiada.ic.unicamp.br/info/competicao_feminina/", "nacional", [TI], 72),
    ("ciic", "CIIC", "Concurso Internacional de Iniciação às Ciências", "https://www.ciic.cnptia.embrapa.br/", "internacional", [CN], 72),
    ("ciiq", "CIIQ", "Concurso Internacional de Iniciação à Química", None, "internacional", [CN], 72),
    ("egmo", "EGMO", "European Girls Mathematical Olympiad", "https://www.egmo.org/", "internacional", [MAT], 72),
    ("egoi", "EGOI", "European Girls Olympiad in Informatics", "https://egoi.org/", "internacional", [TI], 72),
    ("eupho", "EuPhO", "European Physics Olympiad", "https://eupho.ee/", "internacional", [CN], 72),
    ("ibo", "IBO", "International Biology Olympiad", "https://www.ibo-info.org/en/", "internacional", [CN], 73),
    ("ibpho", "IBPhO", "International Brazilian Physics Olympiad", "http://www.ipho-new.org/", "internacional", [CN], 73),
    ("icho", "IChO", "International Chemistry Olympiad", "https://www.ichosc.org/", "internacional", [CN], 73),
    ("imcho", "IMChO", "International Mendeleev Chemistry Olympiad", "https://mendeleevolympiad.org/eng", "internacional", [CN], 73),
    ("imo", "IMO", "International Mathematical Olympiad", "https://www.imo-official.org/", "internacional", [MAT], 73),
    ("ioaa", "IOAA", "International Olympiad on Astronomy and Astrophysics", "https://ioaastrophysics.org/", "internacional", [CN], 73),
    ("ioi", "IOI", "International Olympiad in Informatics", "https://ioinformatics.org/", "internacional", [TI], 73),
    ("ipho", "IPhO", "International Physics Olympiad", "http://www.ipho-new.org/", "internacional", [CN], 73),
    ("obap", "OBAP", "Olimpíada Brasileira de Agropecuária", "https://obap.ifsuldeminas.edu.br/", "nacional", [CN], 73),
    ("obe", "OBE", "Olimpíada Brasileira de Estatística", "https://obe.icmc.usp.br/", "nacional", [MAT], 74),
    ("obec", "OBEC", "Olimpíada Brasileira de Educação Científica", None, "nacional", [MULTI], 74),
    ("obecon", "OBECON", "Olimpíada Brasileira de Economia", "https://obecon.org/", "nacional", [FIN], 74),
    ("obef", "OBEF", "Olimpíada Brasileira de Educação Financeira", "https://prh.uem.br/edfin/obef-olimpiada-brasileira-de-educacao-financeira", "nacional", [FIN], 74),
    ("obf", "OBF", "Olimpíada Brasileira de Física", "https://www1.fisica.org.br/olimpiada/2025/", "nacional", [CN], 74),
    ("obmep-jr", "OBMEP Jr.", "Olimpíada Brasileira de Matemática das Escolas Públicas Júnior", "http://www.obmep.org.br/noticias.DO?id=786", "nacional", [MAT], 74),
    ("obofe", "OBOFE", "Olimpíada Brasileira Online de Física Experimental", "https://noic.com.br/obo/fisica/", "nacional", [CN], 75),
    ("obq", "OBQ", "Olimpíada Brasileira de Química", "https://obquimica.org/olimpiada/olimpiada-brasileira-de-quimica", "nacional", [CN], 75),
    ("ocf", "OCF", "Olimpíada Cearense de Física", "https://necim.ufc.br/pt/ocf/", "estadual", [CN], 75),
    ("ocm", "OCM", "Olimpíada Cearense de Matemática", "https://ocm.mat.br/", "estadual", [MAT], 75),
    ("oiab", "OIAB", "Olimpíada Ibero-Americana de Biologia", "https://www.oiab.org/", "internacional", [CN], 75),
    ("oiaf", "OIAF", "Olimpíada Ibero-Americana de Física", "https://www1.fisica.org.br/~oibf/home/a-olimpiada/index.html", "internacional", [CN], 75),
    ("oiaq", "OIAQ", "Olimpíada Ibero-Americana de Química", "https://obquimica.org/olimpiada/olimpiada-ibero-americana-de-quimica", "internacional", [CN], 76),
    ("oii", "OII", "Olimpíada Iberoamericana de Informática", "https://www.iberoinformatica.org/", "internacional", [TI], 76),
    ("oim", "OIM", "Olimpíada Ibero-Americana de Matemática", "https://olimpiadadematematica.cl/ibero/", "internacional", [MAT], 76),
    ("oimp", "OIMp", "Olimpíada Internacional de Matemática por correspondência (ou online)", None, "internacional", [MAT], 76),
    ("olaa", "OLAA", "Olimpíada Latino-Americana de Astronomia e Astronáutica", "https://www.olaa-astro.org/", "internacional", [CN], 76),
    ("olp", "OLP", "Olimpíada de Língua Portuguesa", "https://olimpiadadeportugues.org/", "nacional", [LC], 76),
    ("omaio", "OMAIO", "Olimpíada de Maio (Iberoamericana)", "https://www.oma.org.ar/internacional/may.htm", "internacional", [MAT], 76),
    ("omerj", "OMERJ", "Olimpíada de Matemática do Estado do Rio de Janeiro", "https://sites.google.com/site/omerj314/omerj", "estadual", [MAT], 76),
    ("omrn", "OMRN", "Olimpíada de Matemática do Rio Grande do Norte", "https://olimpiada.mat.ufrn.br/", "estadual", [MAT], 76),
    ("onsc", "ONSC", "Olimpíada Nacional de Segurança Cibernética", "https://nativosdofuturo.com.br/olimpiada-de-seguranca-cibernetica/", "nacional", [TI], 77),
    ("opm", "OPM", "Olimpíada Paulista de Matemática", "https://www.opm.mat.br/", "estadual", [MAT], 77),
    ("tm2", "TM2", "Torneio Meninas na Matemática", "https://www.tm2.org.br/", "nacional", [MAT], 77),
]

# Fichas que também aparecem na lista da UFC (p. 72 a 77).
UFC_COM_FICHA = [
    "obg", "obi", "obm", "obmep", "obr", "obrl", "oci", "ocq", "ocerq", "obb", "obfep", "oba", "canguru",
    "onc", "onhb", "onia", "olimpiada-de-portugues",
]

# Só nos Radars: (id, sigla, nome, link, nivel, areas, tipo, formato)
SO_RADAR = {
    "oscear": ("OSCEAR", "Olimpíada de Sociologia do Ceará", "https://www.oscear.com.br/", "estadual", [CH], "olimpiada", "prova"),
    "onee": ("ONEE", "Olimpíada Nacional de Eficiência Energética", "https://onee.org.br/", "nacional", [CN, AMB], "olimpiada", "prova"),
    "one": ("ONE", "Olimpíada Nacional de Empreendedorismo", "https://one.ufma.br/documentos/regulamento-one-2026.pdf", "nacional", [FIN], "olimpiada", "prova"),
    "geoinformacao": ("OBGeo", "II Olimpíada Brasileira de Geoinformação", "https://olimpiadadegeoinformacao.com.br/", "nacional", [CH, TI], "olimpiada", "prova"),
    "ia-aplicada": (None, "Olimpíada de Inteligência Artificial Aplicada", "https://olimpiadadeia.ceia.digital/", "nacional", [TI], "olimpiada", "prova"),
    "obbs": ("OBBS", "Olimpíada Brasileira de Biologia Sintética", "https://synbiobr.org/atividades-eventos/olimpiada/", "nacional", [CN], "olimpiada", "projeto"),
}

# Radar: id -> (edição, página, fim, participacao, custo, link)
RADAR = {
    "geoinformacao": ("Julho", 2, "2026-07-15", "individual", "gratuito", None),
    "obg": ("Julho", 3, "2026-07-20", "grupo", "gratuito", "https://obgeografia.com.br/"),
    "ia-aplicada": ("Julho", 4, "2026-07-31", "grupo", "gratuito", None),
    "obbs": ("Julho", 5, "2026-07-31", "individual", "gratuito", None),
    "onc": ("Julho", 6, "2026-08-10", "individual-ou-grupo", "gratuito", "https://www.onciencias.org/"),
    "tfm": ("Julho", 7, "2026-08-14", "individual", "gratuito", "https://tfcbr.inf.ufsm.br/olimpiadas/fisica"),
    "tbc": ("Julho", 8, "2026-08-26", "individual", "gratuito", None),
    "olitef": ("Julho", 9, "2026-09-01", "individual", "gratuito", None),
    "oscear": ("Setembro", 2, "2026-08-19", "grupo", "gratuito", None),
    "oche": ("Setembro", 3, "2026-09-11", "grupo", "gratuito", None),
    "cf-obi": ("Setembro", 4, "2026-09-09", "individual", "gratuito", None),
    "obgp": ("Setembro", 5, "2026-09-09", "individual", "gratuito", "https://www.seletaeducacao.com.br/obgp"),
    "onee": ("Setembro", 6, "2026-09-15", "individual", "gratuito", None),
    "obmf": ("Setembro", 7, "2026-09-23", "individual", "gratuito", "https://www.seletaeducacao.com.br/obmf"),
    "obli": ("Setembro", 8, "2026-10-14", "individual", "gratuito", None),
    "one": ("Setembro", 9, "2026-10-15", "individual", "gratuito", None),
}

# Observações sobre divergências entre documentos.
AVISOS = {
    "obg": "O Catálogo 2026 indica inscrição paga, o Radar de Julho indica gratuita. Confirme no site oficial.",
    "tbc": "O Catálogo 2026 indica inscrição paga, o Radar de Julho indica gratuita. Confirme no site oficial.",
    "obmf": "O Catálogo 2026 indica inscrição paga, o Radar de Setembro indica gratuita. Confirme no site oficial.",
    "oscear": "O Radar de Setembro repete o prazo de 19/08, anterior à própria edição. Confirme no site oficial.",
    "oche": "Prazo era 04/09 no Radar de Julho e passou a 11/09 no Radar de Setembro (foi usado o mais recente).",
    "obli": "O QR Code da OBLI no Radar de Setembro leva ao regulamento da ONE. Foi usado o link do Catálogo 2026.",
}
CAMPOS_EXTRA = {
    "obg": ["custo", "objetivo"], "tbc": ["custo"], "obmf": ["custo"], "oscear": ["inscricoes"], "obli": ["linkOficial"],
    "onc": ["objetivo"], "mcem": ["regulamento vigente"], "onda": ["tema da edição"], "oci": ["publico"], "onfil": ["publico"],
}

# id -> lista de ids para os quais a participação ou a classificação credencia.
CREDENCIA = {"gepemac": ["obm"], "obmep": ["obm"], "ocq": ["obq"], "oba": ["obafog"]}
DESBLOQUEIA = {
    "gepemac": [("credenciamento", "Indicação de estudantes para a fase única da OBM")],
    "obmep": [("credenciamento", "Os 300 melhores colocados de cada nível podem ser convidados para a OBM")],
    "obm": [("medalha", "Medalhistas são convidados para a edição seguinte da OBM")],
    "ocq": [("credenciamento", "Seleciona quem representa o Ceará na Olimpíada Brasileira de Química e na Olimpíada Norte-Nordeste de Química")],
    "oba": [("credenciamento", "A participação na OBA é o que dá direito de participar da OBAFOG")],
    "obr": [("credenciamento", "Classifica equipes para a RoboCup, maior evento de robótica do mundo")],
    "onia": [("credenciamento", "Seleciona talentos para representar o Brasil na Olimpíada Internacional de Inteligência Artificial (IOAI)")],
    "milset-brasil": [("credenciamento", "Projetos podem ser selecionados como finalistas para as olimpíadas globais e regionais da MILSET")],
    "obg": [("credenciamento", "Tem fase nacional e fase internacional")],
}
TEXTO_UFC = "Medalha de ouro, prata ou bronze aceita no edital de ingresso por olimpíadas da UFC (cursos presenciais, 2026)"

TROCAS = {
    "ﬁ": "fi", "ﬂ": "fl", "‌": "", "​": "", "\xa0": " ", "—": ",", "–": ",",
    "Estuantes": "Estudantes", "Indiviual": "Individual", "mostrandoa": "mostrando-a",
    "ensinoaprendizagem": "ensino-aprendizagem", "seletar talentos": "selecionar talentos",
    "6º ao 9º ano ano": "6º ao 9º ano",
}


def limpar(t):
    for de, para in TROCAS.items():
        t = t.replace(de, para)
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"\b(\d)o\b(?= ano|,| e | do)", r"\1º", t)
    t = re.sub(r"\b(\d)a\b(?= série|,| e | à)", r"\1ª", t)
    t = re.sub(r"\.\s*\.+", ".", t)
    t = re.sub(r"\s+([.,;])", r"\1", t)
    t = re.sub(r",\s*,", ",", t)
    return t.strip(" .") + "." if t.strip(" .") else ""


def campo(texto, rotulo, fim):
    m = re.search(rotulo + r"\s*:?\s*(.*?)(?=" + fim + ")", texto, re.S)
    return m.group(1).strip() if m else ""


def participacao(t):
    t = t.lower()
    if "individual" in t and "grupo" in t:
        return "individual-ou-grupo"
    if "grupo" in t:
        return "grupo"
    if "indiv" in t:
        return "individual"
    return None


def custo(t):
    b = t.lower()
    if "valores" in b:
        return {"tipo": "valor", "observacao": limpar(t)}
    if "paga" in b:
        return {"tipo": "pago", "observacao": None}
    if "gratuit" in b:
        return {"tipo": "gratuito", "observacao": "Gratuita para escolas públicas." if "públicas" in b else None}
    return {"tipo": None, "observacao": None}


def extrair_ficha(pag):
    bruto = pag.get_text().replace("‌", "")
    links = [l["uri"] for l in pag.get_links() if l.get("uri")]
    corpo = bruto.split("Para maiores informações")[0]
    fim = r"OBJETIVO|TIPO DE PARTICIPA|INSCRIÇÃO|QUEM\s+PODE|OBSERVAÇ|$"
    descricao = limpar(corpo.split("OBJETIVO")[0])
    objetivo = limpar(campo(corpo, r"OBJETIVO", r"TIPO DE PARTICIPA"))
    part = campo(corpo, r"TIPO DE PARTICIPAÇÃO", r"INSCRIÇÃO")
    insc = campo(corpo, r"INSCRIÇÃO", r"QUEM\s+PODE")
    quem = re.sub(r"\s+", " ", campo(corpo, r"QUEM\s+PODE\s+PARTICIPAR", r"OBSERVAÇ|$"))
    obs = campo(corpo, r"OBSERVAÇÕES", r"$")
    return descricao, objetivo, part, insc, limpar(quem), limpar(obs.lstrip(": *")), (links[0] if links else None)


def base(id_, sigla, nome, tipo, nivel, areas, series, formato, organizador, modalidade, link, fonte):
    return {
        "id": id_, "slug": id_, "nome": nome, "sigla": sigla, "tipo": tipo, "organizador": organizador,
        "areas": areas, "publico": {"texto": None, "series": series}, "modalidade": modalidade,
        "participacao": None, "nivel": nivel, "formato": formato,
        "custo": {"tipo": None, "observacao": None}, "descricao": None, "objetivo": None, "observacoes": None,
        "inscricoes": {"inicio": None, "fim": None}, "provas": [], "linkOficial": link, "comoParticipar": [],
        "desbloqueia": [], "credenciaPara": [], "financiavelJOC": True, "fonte": fonte,
        "aConfirmar": True, "camposAConfirmar": [], "atualizadoEm": HOJE,
    }


def main():
    catalogo = pymupdf.open(DOCS / "Catalogo de Olimpiadas 2026.pdf")
    itens = {}

    for p, f in FICHAS.items():
        id_, sigla, nome, tipo, nivel, areas, series, formato, org, mod = f
        descricao, objetivo, part, insc, quem, obs, link = extrair_ficha(catalogo[p - 1])
        i = base(id_, sigla, nome, tipo, nivel, areas, series, formato, org, mod, link, f"Catálogo 2026, p. {p}")
        i["descricao"] = descricao
        i["objetivo"] = objetivo
        i["participacao"] = participacao(part)
        i["custo"] = custo(insc)
        i["publico"]["texto"] = quem
        i["observacoes"] = obs or None
        itens[id_] = i

    for id_, sigla, nome, link, nivel, areas, p in SO_UFC:
        i = base(id_, sigla, nome, "olimpiada", nivel, areas, [], "prova", None, None, link, f"Catálogo 2026, p. {p} (lista da UFC)")
        i["financiavelJOC"] = False
        if link is None:
            i["observacoes"] = "O catálogo não identificou site oficial ativo no período de elaboração."
        itens[id_] = i

    for id_, (sigla, nome, link, nivel, areas, tipo, formato) in SO_RADAR.items():
        itens[id_] = base(id_, sigla, nome, tipo, nivel, areas, [], formato, None, None, link, "")

    # Radars: Julho primeiro, Setembro por cima (a edição mais nova vale).
    for id_, (edicao, p, fim, part, cus, link) in RADAR.items():
        i = itens[id_]
        i["inscricoes"]["fim"] = fim
        i["participacao"] = part
        obs_custo = i["custo"].get("observacao")
        i["custo"] = {"tipo": cus, "observacao": obs_custo}
        if link:
            i["linkOficial"] = link
        trecho = f"Radar {edicao} 2026, p. {p}"
        i["fonte"] = f"{trecho}; {i['fonte']}" if i["fonte"] else trecho

    for id_, aviso in AVISOS.items():
        atual = itens[id_]["observacoes"]
        itens[id_]["observacoes"] = f"{atual} {aviso}" if atual else aviso

    for id_ in UFC_COM_FICHA + [x[0] for x in SO_UFC]:
        itens[id_]["desbloqueia"].append({"tipo": "vaga-olimpica", "texto": TEXTO_UFC})
    for id_, lista in DESBLOQUEIA.items():
        itens[id_]["desbloqueia"] += [{"tipo": t, "texto": x} for t, x in lista]
    for id_, destinos in CREDENCIA.items():
        itens[id_]["credenciaPara"] = destinos

    # Os dois eventos da própria SEDUC citados no regulamento e no briefing.
    cc = base(
        "ceara-cientifico", None, "Ceará Científico", "feira", "estadual", [MULTI], [], "projeto",
        "SEDUC Ceará", "presencial", "https://educientifica.seduc.ce.gov.br/feiradeciencias/login.jsf",
        "Briefing COPES; Tutorial do Portal Educação Científica 2026",
    )
    cc["descricao"] = "Política da SEDUC de popularização da ciência, em três etapas: escolar, regional e estadual, com inscrição no Portal Educação Científica."
    cc["custo"] = {"tipo": None, "observacao": None}
    cc["comoParticipar"] = [
        "Desenvolva o projeto na escola com um professor orientador.",
        "A escola acessa o Portal Educação Científica com o login que já possui.",
        "O projeto avança pelas etapas escolar, regional e estadual.",
    ]
    cc["desbloqueia"] = [{"tipo": "credenciamento", "texto": "Participar conta 10 pontos na matriz de prioridade do JOC no ano seguinte"}]
    itens[cc["id"]] = cc
    fest = base("alunos-que-inspiram", None, "Festival Alunos que Inspiram", "evento", "estadual", [MULTI], [], "projeto", "SEDUC Ceará", None, None, "Regulamento JOC 2026, item 5.4")
    fest["descricao"] = "Evento científico da SEDUC citado no Regulamento JOC 2026. Participar conta 10 pontos na matriz de prioridade do JOC no ano seguinte."
    fest["desbloqueia"] = [{"tipo": "credenciamento", "texto": "Participar conta 10 pontos na matriz de prioridade do JOC no ano seguinte"}]
    itens[fest["id"]] = fest

    # Passos padrão e lista do que falta confirmar em cada item.
    for i in itens.values():
        if not i["comoParticipar"]:
            passos = []
            if i["publico"]["texto"]:
                passos.append("Confira se sua série e sua escola estão no público da olimpíada.")
            if i["id"] in ("obli", "obgp"):
                passos.append("Peça a um professor ou gestor para fazer a inscrição: assim ela fica gratuita para escola pública.")
            if i["id"] in ("oba", "obafog", "obfep"):
                passos.append("A escola precisa ter um professor responsável cadastrado.")
            if i["linkOficial"]:
                passos.append("Veja regulamento, datas e inscrição no site oficial.")
            passos.append("Depois de participar, avise a escola para registrar no Portal Educação Científica.")
            i["comoParticipar"] = passos
        faltando = []
        if not i["inscricoes"]["fim"]:
            faltando.append("inscricoes")
        if not i["provas"]:
            faltando.append("provas")
        if not i["modalidade"]:
            faltando.append("modalidade")
        if not i["publico"]["texto"]:
            faltando.append("publico")
        if not i["custo"]["tipo"]:
            faltando.append("custo")
        if not i["linkOficial"]:
            faltando.append("linkOficial")
        if not i["financiavelJOC"]:
            faltando.append("financiavelJOC")
        i["camposAConfirmar"] = sorted(set(faltando + CAMPOS_EXTRA.get(i["id"], [])))
        i["aConfirmar"] = bool(i["camposAConfirmar"])

    # Conferência: nenhum travessão no texto final.
    lista = sorted(itens.values(), key=lambda x: x["nome"])
    saida = json.dumps(lista, ensure_ascii=False, indent=2)
    assert "—" not in saida and "–" not in saida
    (RAIZ / "data" / "oportunidades.json").write_text(saida + "\n", encoding="utf-8")
    print(len(lista), "oportunidades gravadas")


if __name__ == "__main__":
    main()
