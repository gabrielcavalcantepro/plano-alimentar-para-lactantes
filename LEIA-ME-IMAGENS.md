# Leia-me: imagens placeholder

Todas as imagens abaixo estão em `/assets/placeholders/` e aparecem no quiz como uma
caixa bege com borda tracejada, o texto "IMAGEM PLACEHOLDER" e o nome do arquivo
escrito dentro. Isso é só pra deixar óbvio, ao navegar pelo quiz, quais espaços ainda
precisam de imagem real.

**Para trocar por uma imagem real, basta substituir o arquivo mantendo exatamente o
mesmo nome e a mesma pasta.** O HTML já referencia esses nomes diretamente
(`<img src="assets/placeholders/etapa00-produto-mockup.png">` etc.), então não é
preciso mexer em nenhum código, CSS ou JS. Assim que o arquivo novo for salvo no lugar
do antigo (mesmo nome, mesma extensão), a imagem real passa a aparecer automaticamente
no quiz.

Dica: para manter o carregamento rápido (importante em tráfego pago direto pro quiz),
exporte as imagens reais já otimizadas para web (JPG comprimido para fotos, PNG só
onde precisar de transparência) e evite arquivos muito acima de 150 a 250 KB cada.

## Lista completa

| Arquivo | Etapa | O que precisa ser | Proporção sugerida |
|---|---|---|---|
| `etapa00-produto-mockup.png` | Etapa 0 (Abertura) | Imagem de produto: mockup de celular exibindo o app/avaliação + a folha do cardápio impresso ao lado. | Retrato, ~480x600 |
| `etapa02-corpo-tipo1.png` | Etapa 2 (Corpo, ilustração) | Ilustração de corpo feminino em pose neutra, Tipo 1 (mais cheio dos quatro). Não usar as ilustrações do quiz de referência, é arte de terceiro. | Retrato, ~320x480 |
| `etapa02-corpo-tipo2.png` | Etapa 2 | Ilustração de corpo feminino, Tipo 2 (intermediário). | Retrato, ~320x480 |
| `etapa02-corpo-tipo3.png` | Etapa 2 | Ilustração de corpo feminino, Tipo 3 (intermediário). | Retrato, ~320x480 |
| `etapa02-corpo-tipo4.png` | Etapa 2 | Ilustração de corpo feminino, Tipo 4 (mais magro dos quatro). | Retrato, ~320x480 |
| `etapa08-antes-depois-01.jpg` | Etapa 8 (Prova social #1) | Foto antes/depois real de uma paciente, caso 1. | Paisagem, ~640x400 |
| `etapa08-antes-depois-02.jpg` | Etapa 8 | Foto antes/depois real, caso 2. | Paisagem, ~640x400 |
| `etapa08-antes-depois-03.jpg` | Etapa 8 | Foto antes/depois real, caso 3. | Paisagem, ~640x400 |
| `etapa12-print-depoimento.jpg` | Etapa 12 (Bloco educacional) | Print real de depoimento de paciente (Instagram ou WhatsApp). | Retrato, ~380x600 |
| `etapa13-antes-depois.jpg` | Etapa 13 ("Por que algumas mães emagrecem fácil") | Foto antes/depois real. | Paisagem, ~640x400 |
| `etapa22-print-conversa-01.jpg` | Etapa 22 (Prova social #2) | Print real de conversa (WhatsApp ou Instagram) entre a nutricionista e uma paciente. | Retrato, ~380x600 |
| `etapa22-print-conversa-02.jpg` | Etapa 22 | Print real de conversa, exemplo 2. | Retrato, ~380x600 |
| `etapa22-print-conversa-03.jpg` | Etapa 22 | Print real de conversa, exemplo 3. | Retrato, ~380x600 |
| `etapa22-print-conversa-04.jpg` | Etapa 22 | Print real de conversa, exemplo 4. | Retrato, ~380x600 |
| `etapa23-antes-depois.jpg` | Etapa 23 (Tela de carregamento) | Foto antes/depois real que aparece perto do fim da barra de progresso, com a tag "Resultado Verificado". | Paisagem, ~500x350 |
| `etapa25-antes-depois-01.jpg` | Etapa 25e (Oferta final, mais prova social) | Foto antes/depois real, caso 1. | Paisagem, ~640x400 |
| `etapa25-antes-depois-02.jpg` | Etapa 25e | Foto antes/depois real, caso 2. | Paisagem, ~640x400 |
| `etapa25-antes-depois-03.jpg` | Etapa 25e | Foto antes/depois real, caso 3. | Paisagem, ~640x400 |

## Texto de placeholder que também precisa ser trocado

Nas Etapas 8, 22, 23 e 25e, além da imagem, o texto ao redor também está marcado como
placeholder (entre colchetes, ex: `[Resultado real: -X kg em Y semanas]`,
`[Depoimento real da paciente entra aqui.]`, `[Nome], [idade] anos, [Cidade]`). Isso é
proposital: a spec do projeto pediu que nenhum depoimento ou resultado fosse
inventado. Esse texto está direto no `index.html`, dentro de cada bloco `.caso-social`
ou `.conversa-bloco`, e precisa ser editado manualmente junto com a troca da imagem
correspondente.

## O que não tem placeholder (de propósito)

A seção "Quem sou eu?" (Etapa 25g, bio da nutricionista) foi deixada completamente em
branco no código, sem imagem nem texto de placeholder, porque a spec do projeto
determinou que nada ali deveria ser inventado, nem como exemplo. No `index.html`, essa
etapa tem apenas um comentário `<!-- AGUARDANDO BIO REAL DA NUTRICIONISTA -->` no
lugar. Quando o texto da bio e a foto forem enviados pela cliente, esse bloco precisa
ser construído do zero (texto + imagem), não é uma simples troca de arquivo como os
itens da lista acima.
