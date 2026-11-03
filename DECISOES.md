# Decisões do projeto (Radar Olímpico v0.1)

Registro das decisões tomadas sem perguntar, e das dúvidas para a COPES validar.

## Estrutura e design

- **Pasta do projeto:** `repos/radar-olimpico`. Os materiais não estavam no computador e foram baixados da pasta do Drive "JUVENTUDE OLÍMPICA DO CONHECIMENTO" (com autorização). `materiais/` fica fora do Git: são 430 MB.
- **Logo SEDUC:** não está na pasta "Logos Oficiais" do Drive. Usei o logo do Governo do Ceará/Secretaria da Educação que já estava no repositório do portfólio. Conferir se é a versão vigente.
- **Fontes:** Montserrat nos títulos (próxima do logo JOC) e fonte do sistema no corpo, para pesar pouco em 3G.
- **Paleta:** extraída dos logos. JOC: laranja `#F58A33`, turquesa `#00C9C8`, amarelo `#FDC13F`. Ceará Científico: verde `#2E8F54`, laranja `#F2763C`, grafite `#606062`. Laranja puro não passa AA como texto sobre branco: botões usam texto escuro sobre laranja e links usam laranja escurecido `#A84A08`.
- **Navegação:** barra inferior no celular com Início, Radar, Descubra, Minha lista e Menu.
- **TypeScript 5.9:** a versão 7 recém-lançada foi evitada por compatibilidade com o Next.
