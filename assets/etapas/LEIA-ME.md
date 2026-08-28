# Como subir as imagens reais do quiz

Cada pasta aqui dentro corresponde a uma etapa do quiz que tem imagem.
Suba os arquivos reais (fotos antes/depois, prints de depoimento,
ilustrações de corpo etc.) dentro da pasta da etapa correspondente,
**com o nome que quiser** (não precisa manter nenhum nome específico).

| Pasta | Etapa | Quantas imagens | Status |
|---|---|---|---|
| `etapa00-abertura/` | Etapa 0 (Abertura) | 1 | ✅ Recebido e no ar |
| `etapa02-corpo/` | Etapa 2 (Corpo, ilustração) | 4 | ✅ Recebido e no ar |
| `etapa08-prova-social-1/` | Etapa 8 (Mães Reais. Resultados Reais.) | 3 | ✅ Recebido e no ar |
| `etapa12-depoimento/` | Etapa 12 (Bloco educacional) | 3 (você mandou 3 em vez de 1, todas incluídas) | ✅ Recebido e no ar |
| `etapa13-antes-depois/` | Etapa 13 (Por que algumas mães emagrecem fácil) | 1 | ✅ Recebido e no ar |
| `etapa22-conversas/` | Etapa 22 (O que as mamães estão dizendo) | 5 (você mandou 5 em vez de 4, todas incluídas) | ✅ Recebido e no ar |
| `etapa23-loading/` | Etapa 23 (Tela de carregamento) | 1 | ✅ Recebido e no ar |
| `etapa25-prova-social-2/` | Etapa 25 (Oferta final) | 3 | ✅ Recebido e no ar |
| `etapa25-bio/` | Etapa 25 (bloco "Quem sou eu?") | 2 (foto de perfil + foto de destaque) | ✅ Recebido e no ar |

Cada pasta tem seu próprio `LEIA-ME.txt` com o detalhe do que essa
imagem específica precisa ser.

## Como as imagens recebidas foram tratadas

Todas as imagens enviadas foram convertidas para **WEBP** (mantendo a
proporção e orientação original de cada uma, sem cortar nem forçar
formato quadrado/retângulo, com transparência preservada onde existia,
como no mockup da Etapa 0) e organizadas dentro da pasta de cada etapa
com nomes claros (`tipo1.webp`, `caso-01.webp`, `depoimento-01.webp`,
`perfil.webp`, `destaque.webp` etc.). Os arquivos originais que você
enviou não foram apagados, estão arquivados em
`_originais-png-recebidos/` caso precise deles de novo.

O `index.html` já foi atualizado para usar esses arquivos reais no
lugar dos placeholders cinza, em todas as etapas com imagem.

## Bloco "Quem sou eu?" (bio da nutricionista)

Já está no ar na última etapa, montado com o texto real que você
mandou (condensado pra ficar num tamanho parecido com o da referência,
mantendo todos os fatos: nutricionista desde 2016, sempre magra antes,
69kg → 83kg na gestação, ciclo de compulsão alimentar por 8 meses
depois do parto, decisão de mudar e -10kg em 3 meses). A foto de perfil
entra como avatar circular, e a foto de destaque (grávida com a
família) aparece logo abaixo do texto, seguida do reforço final e do
botão de CTA, do mesmo jeito que a referência mostrava.

**Falta só uma coisa: o nome dela.** Não foi enviado em nenhum momento,
então deixei `[Nome da nutricionista]` como placeholder óbvio no lugar
certo (`index.html`, dentro de `.bio-nome`, logo abaixo da foto de
perfil). Assim que você me passar o nome, eu troco.

## O que ainda falta

- **Nome da nutricionista** (ver acima).
- Os textos ao redor das fotos de prova social (resultado em kg,
  depoimento escrito, nome/idade/cidade nas Etapas 8 e 25, e a citação
  de cada conversa na Etapa 22) continuam como placeholder entre
  colchetes, porque só as imagens foram enviadas até agora.
