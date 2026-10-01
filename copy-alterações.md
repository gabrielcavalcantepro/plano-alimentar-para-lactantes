# Instruções para o Claude Code — Atualização do Quiz "Plano Alimentar Para Lactantes"

Este arquivo é a **especificação completa** das alterações no quiz. Aplique tudo o que está aqui, usando a copy **exatamente** como escrita (não reescreva, não "melhore" os textos). Onde houver dúvida técnica, siga o padrão que já existe no código.

---

## 0. Como trabalhar

1. **Antes de editar qualquer coisa**, leia `index.html` e `js/app.js` por completo e identifique:
   - como as etapas são numeradas/ordenadas e como a navegação (avançar, voltar) funciona;
   - o objeto/estado onde as respostas são guardadas (siga o mesmo padrão para as novas respostas);
   - como funciona a barra de progresso e o contador de etapas (ela deve ser **recalculada automaticamente** com o novo total, nada hardcoded);
   - como o padrão da **Etapa 20** funciona (bloco de destaque `💡` que aparece após a escolha + botão "Continuar →"). As 5 etapas novas usam esse mesmo padrão;
   - se existe rastreamento por etapa (Pixel, UTMify, GA etc.): atualize nomes/ordem das etapas nos eventos.
2. Faça `grep` por referências às etapas que serão removidas (7 e 21) e por quaisquer variáveis que dependam delas, para não quebrar cálculos.
3. Faça `grep` por `1.075`, `1075`, `Consultoria`, `consultoria`, `mentoria` e `7 dias` para achar todas as ocorrências que precisam mudar.
4. Preserve o estilo visual existente (classes, cores, tipografia). Novas etapas devem reutilizar os componentes das etapas atuais (cards de opção, multi-seleção com botão "Continuar →", bloco de destaque).
5. Ao final, rode o quiz inteiro (ver seção 10) e confirme que nada quebrou.

---

## 1. Resumo das mudanças (checklist)

- [ ] Remover as etapas **7** e **21** (e levar o conteúdo da 21 para a 24)
- [ ] Renomear o título da etapa **4**
- [ ] Criar **5 etapas novas** (N1 a N5) nas posições definidas
- [ ] Nova headline e ajustes na **abertura (etapa 0)**
- [ ] Remover microcopies da **etapa 1**
- [ ] Teto de ritmo na **projeção** (etapa 20 em diante)
- [ ] **Taxa de queima** variável na etapa 24
- [ ] **Loading** personalizado (etapa 23)
- [ ] **Oferta (etapa 25)**: recap das respostas, bio curta antes do preço, bônus novos, "De R$925", plano básico com 1 ano
- [ ] **Modal de retenção**: novo valor "De R$925" e ajuste de texto
- [ ] Remover **placeholders ocultos** e o **depoimento fictício**
- [ ] Ordem **dinâmica dos bônus** conforme respostas

---

## 2. O que NÃO alterar

Não mexer em:

- **Preços de venda**: Super Oferta **R$19,90** e Plano Básico **R$10,90**.
- Links/botões de checkout e a lógica que leva a cada um.
- **Toast de compra** (fila de notificações) e a lista `NOMES_COMPRAS_FAKE`.
- **Contador** "mamães testando agora" da abertura.
- **Aviso de escassez** da abertura ("Esta avaliação está disponível somente uma vez por pessoa...") e a frase "Pode ser a última vez que você acessa esta página" na etapa 25f.
- Garantia de 90 dias (etapa 25d), rodapé, selos "+20 mil mães" e "Mantém o Leite".
- Lógica da **APLV** (etapa 15 e aviso/versão na oferta).
- Cálculo de IMC e a estrutura geral das etapas 16, 17 e 18 (sliders).

---

## 3. Nova ordem das etapas (29 telas)

```
0   Abertura
1   Idade
2   Corpo (ilustração)
3   O que quer mudar
4   Corpo (texto)               ← título renomeado
5   Partes do corpo
6   Tempo amamentando
N1  O que você já tentou        ← NOVA
8   Prova social #1
9   Captura de nome
10  Pós-parto
N2  Espelho                     ← NOVA
N3  Alimentação pós-bebê        ← NOVA
11  O que travou resultados
N4  Quando a comida domina      ← NOVA
N5  Sono                        ← NOVA
12  Bloco educacional
13  Por que algumas emagrecem
14  Tempo para preparar refeições
15  APLV
16  Peso atual
17  Altura
18  Peso com que se sentiria bem
19  Ocasião especial
20  Prazo do objetivo
22  Prova social #2
23  Loading
24  Resultado único (perfil + projeção)
25  Oferta final
```

Etapas **removidas**: 7 e 21. O botão "Continuar →" da etapa 20 passa a levar para a etapa 22.

Observação: o nome é capturado na etapa 9, então N2 em diante pode usar `{nome}`. N1 vem antes do nome e **não** usa `{nome}`.

---

## 4. Remoções

### 4.1 Remover etapa 7 por completo
"Quanto acima do seu peso ideal você está hoje?" (HTML, JS, validações, progresso). Confirme com `grep` que nenhum cálculo depende dessa resposta; o peso a perder continua vindo de peso atual e peso desejado (etapas 16 e 18).

### 4.2 Remover etapa 21 por completo
"Resultado / projeção". O gráfico, a tabela de marcos semanais e o bloco de destaque com ocasião especial **migram para a etapa 24** (ver seção 5.8).

### 4.3 Remover textos ocultos e placeholders
Em **todas** as ocorrências (etapas **8**, **23** e **25e**), apagar do HTML (e do JS/CSS que só servia para eles) os elementos marcados como `oculto`:
- tag `[Resultado real: -X kg em Y semanas]`
- depoimento `"[Depoimento real da paciente entra aqui.]"`
- autor `[Nome], [idade] anos, [Cidade]`
- depoimento curto `"[Depoimento curto real entra aqui.]"` (loading)

**Manter** as imagens antes/depois e a tag "Resultado Verificado" do loading.

### 4.4 Remover depoimento fictício da etapa 12
Apagar o bloco de destaque:
> 🎉 Uma paciente aumentou a produção de leite e desinchou em apenas duas semanas seguindo o Plano Alimentar!

Manter todo o resto da etapa 12 (texto, bloco 💚, 3 imagens de depoimentos reais, comparação ❌/✅, botão).

### 4.5 Remover selo "100% Natural" da abertura
Manter apenas `+20 mil mães` e `Mantém o Leite`.

---

## 5. Alterações em etapas existentes

### 5.1 Etapa 0 — Abertura

- **Headline** (destacar "roupas de antes da gestação"):
  **Volte a vestir suas roupas de antes da gestação em 8 semanas, sem secar o leite**
- Subheadline: manter como está.
- Selos: `+20 mil mães` · `Mantém o Leite`
- Botão: **Fazer meu diagnóstico grátis →**
- Microcopy: **Diagnóstico Grátis · Cerca de 3 minutos**
- Contador e aviso de escassez: manter (ver seção 2).

### 5.2 Etapa 1 — Idade

Manter título e subtítulo. **Remover as microcopies** das opções, deixando só emoji + faixa:

- 🌱 18 a 24 anos
- 🌸 25 a 29 anos
- 🌿 30 a 34 anos
- 🍃 35 a 39 anos
- 🌷 40 anos ou mais

### 5.3 Etapa 4 — Corpo (texto)

- Novo título: **Qual dessas frases mais parece com você?**
- Subtítulo: manter ("Seja honesta, isso personaliza sua solução").
- Opções e valores internos: sem mudança (a lógica do "perfil metabólico" na etapa 24 continua usando essa resposta).

### 5.4 Etapa 12 — Bloco educacional

Apenas a remoção do depoimento fictício (seção 4.4).

### 5.5 Etapa 20 — Prazo do objetivo (teto realista)

Manter título, subtítulo e as 4 opções. Implementar a lógica da **seção 7.1**. Quando o prazo escolhido for menor que o realista, **trocar** o bloco de destaque `💡` padrão por este (com variáveis):

> 💡 Para perder **{diferença} kg** com segurança enquanto você amamenta, o prazo realista é de cerca de **{N} semanas**. Ajustamos a sua projeção para você chegar lá com saúde.

Se o prazo escolhido já for realista, manter o texto atual:
> 💡 Com o Plano Alimentar Para Lactantes, mães lactantes emagrecem no ritmo seguro, de forma saudável e mantendo o leite.

Botão "Continuar →" aparece após a escolha (comportamento atual) e leva à etapa 22.

### 5.6 Etapa 23 — Loading

Ver seção 7.3 (checklist personalizado). Remover o depoimento curto oculto (seção 4.3).

### 5.7 Etapa 22 — Prova social #2

Sem mudanças de copy. Apenas passa a vir logo depois da etapa 20.

### 5.8 Etapa 24 — Resultado único (perfil + projeção)

Esta etapa passa a absorver a antiga etapa 21. Estrutura final, de cima para baixo:

1. **Eyebrow:** 🎯 Com base no seu diagnóstico...
2. **Título:** Prevemos que você pesará `{peso desejado}` kg até `{data final}`! *(usar a data calculada com o teto da seção 7.1)*
3. **Subtítulo:** 🎊 Boa notícia! Sua meta é alcançável
4. **Gráfico de projeção de peso** (canvas, o completo da antiga etapa 21) + **tabela de marcos semanais**.
   - Remover o "gráfico simplificado de previsão" e o bloco "Previsão personalizada para `{nome}`", que ficam redundantes.
5. **Bloco "você pode secar entre {faixa}"** (como já existe).
6. **IMC** (como já existe).
7. **Seu Perfil Nutricional** (como já existe: objetivo, meta, perfil metabólico, versão do cardápio).
8. **Taxa de Queima de Gordura**, agora **variável** (seção 7.2).
9. **Comparação** Sem/Com Plano Alimentar (como já existe).
10. **Bloco de destaque** (vindo da antiga 21, dinâmico):
    > 🎊 Seguindo o Plano Alimentar Para Lactantes, `{nome}` pode chegar `{em "ocasião especial", se houver}` com o corpo que deseja sem parar de amamentar e sem dietas restritivas!
11. **Botão:** Ver meu Cardápio Personalizado →

---

## 6. Novas etapas (copy exata)

**Padrão para as 5 etapas novas** (igual à etapa 20): o usuário escolhe → aparece um **bloco de destaque** com a "Reação" → aparece o botão **"Continuar →"**. Nas etapas de múltipla seleção, a reação aparece após a primeira seleção. Guardar as respostas no estado (sugestão de chaves: `jaTentou`, `espelho`, `alimentacaoPosBebe`, `momentoComida`, `sono`; ajuste ao padrão do código).

### N1 — O que você já tentou? *(entre as etapas 6 e 8; múltipla seleção)*

- **Título:** O que você já **tentou** para emagrecer?
- **Subtítulo:** Pode selecionar mais de uma opção
- **Opções:**
  - 🥗 Dieta restritiva ou cortar carboidrato
  - 🍵 Chás, shakes ou suplementos
  - 🏃‍♀️ Exercício sem ajustar a alimentação
  - 👩‍⚕️ Plano de nutricionista que não encaixou na amamentação
  - 🤷‍♀️ Ainda não tentei nada *(opção exclusiva: ao marcar, desmarca as demais)*
- **Reação** (se marcou qualquer opção que não seja "Ainda não tentei nada"):
  > 💡 Planos feitos para quem não amamenta cobram energia e leite. Vamos entender por quê.
- **Reação** (se marcou "Ainda não tentei nada"):
  > 💡 Então você está no lugar certo para começar do jeito certo, sem passar pelo que cansa tantas mães.
- **Botão:** Continuar →

### N2 — Espelho *(depois da etapa 10; seleção única)*

- **Título:** `{nome}`, o que você sente quando se **olha no espelho** hoje?
- **Subtítulo:** Seja sincera, não existe resposta errada
- **Opções:**
  - 😔 Não me reconheço
  - 💭 Tenho saudade do meu corpo de antes
  - 📸 Evito fotos
  - 🙂 Estou bem, mas quero me sentir melhor
- **Reação:**
  > 💡 Isso é mais comum do que parece, e dá para mudar sem punir seu corpo.
- **Botão:** Continuar →

### N3 — Alimentação pós-bebê *(depois da N2; múltipla seleção)*

- **Título:** Como ficou a sua **alimentação** depois que o bebê nasceu?
- **Subtítulo:** Pode selecionar mais de uma opção
- **Opções:**
  - 🍽️ Como o que sobra do prato do bebê ou da família
  - ⏩ Como em pé, entre uma mamada e outra
  - 🕐 Pulo refeições e depois exagero
  - 🍫 Belisco doce para aguentar
  - 🛵 Peço delivery porque não sei o que cozinhar
- **Reação:**
  > 💡 A rotina de quem cuida de um bebê quase não deixa espaço para comer direito. É aí que o peso trava.
- **Botão:** Continuar →

### N4 — Quando a comida domina *(depois da etapa 11; seleção única)*

- **Título:** Em que momento a comida mais **te domina**?
- **Subtítulo:** Escolha o momento mais difícil para você
- **Opções:**
  - 🌅 De manhã, na correria
  - 🌤️ À tarde
  - 🌙 À noite, quando o bebê dorme
  - 🌌 Na madrugada, nas mamadas
  - 😰 Quando estou ansiosa ou cansada
- **Reação:**
  > 💡 Anotado. Seu plano vai ter uma estratégia para esse momento.
- **Botão:** Continuar →

### N5 — Sono *(depois da N4; seleção única)*

- **Título:** Quantas horas você consegue **dormir** por noite, somando os cochilos?
- **Subtítulo:** Entre uma mamada e outra, conta tudo
- **Opções:**
  - 😵 Menos de 4h
  - 😴 4 a 5h
  - 🌙 6h ou mais
- **Reação** (Menos de 4h ou 4 a 5h):
  > 💡 Dormir pouco aumenta a fome e a vontade de doce. Não é falta de força de vontade.
- **Reação** (6h ou mais):
  > 💡 Ótimo, o sono é um grande aliado. Vamos aproveitar isso no seu plano.
- **Botão:** Continuar →

---

## 7. Lógica nova

### 7.1 Teto de ritmo na projeção

Criar uma constante configurável no topo do `js/app.js`:

```js
const RITMO_MAX_KG_SEMANA = 1; // 4 kg/mês, conforme a nutricionista. Fácil de ajustar.
```

Regras:
- `diferença = peso atual − peso desejado` (se ≤ 0, manter o comportamento atual: "Ajuste o peso desejado...").
- `semanasMinimas = ceil(diferença / RITMO_MAX_KG_SEMANA)`.
- Prazos das opções da etapa 20: 4 semanas, 2 meses (8), 3 meses (12), 4 meses (16).
- Se o prazo escolhido (em semanas) for **menor** que `semanasMinimas`, usar `semanasMinimas` para calcular a **data final**, o **gráfico**, a **tabela de marcos** e a faixa "você pode secar entre". Mostrar a mensagem da seção 5.5.
- Se for maior ou igual, usar o prazo escolhido normalmente.
- O ritmo semanal nunca pode ultrapassar `RITMO_MAX_KG_SEMANA` em nenhum ponto da projeção.

### 7.2 Taxa de queima de gordura variável (etapa 24)

Substituir o texto fixo "Lenta" por um cálculo de 3 níveis:

**Nível base**, pela resposta da etapa 4:

| Resposta da etapa 4 | Nível base |
|---|---|
| ⚖️ Controlo a alimentação, mas o peso não cai | Lenta |
| 🐢 Meu metabolismo está completamente travado | Lenta |
| 🎯 Tenho gordura acumulada que não consigo eliminar | Média |
| 💧 Fico inchada com facilidade e me sinto pesada | Média |

**Ajuste pelo sono (N5):** "Menos de 4h" → um nível mais lento (mínimo Lenta). "6h ou mais" → um nível mais rápido (máximo Rápida). "4 a 5h" → sem ajuste.

**Textos por nível** (a posição do marcador na barra usa o mecanismo atual: Lenta ≈ 15%, Média ≈ 50%, Rápida ≈ 85%):
- Lenta: `Lenta, mas o Plano Alimentar vai corrigir isso 🔥`
- Média: `Média, e o Plano Alimentar vai acelerar isso 🔥`
- Rápida: `Rápida, e o Plano Alimentar vai manter esse ritmo 🔥`

Se não houver resposta (fallback), usar Lenta.

### 7.3 Loading personalizado (etapa 23)

Checklist animado final (6 linhas; ajuste os tempos da animação para continuar fluida e a barra chegar a 100% no mesmo tempo total de hoje ou até 1 segundo a mais):

1. ✓ Analisando suas respostas...
2. ✓ Calculando seu IMC e perfil...
3. ✓ `{linha de sono}`
4. ✓ `{linha de momento}`
5. ✓ `{linha de tempo de preparo}`
6. ✓ Montando seu cardápio exclusivo...

**Linha de sono** (N5):
- Menos de 4h → `Ajustando o plano para quem dorme menos de 4h...`
- 4 a 5h → `Ajustando o plano para quem dorme de 4 a 5h...`
- 6h ou mais → `Ajustando o plano para a sua rotina de sono...`

**Linha de momento** (N4):
- De manhã → `Incluindo estratégia para a sua manhã...`
- À tarde → `Incluindo estratégia para a sua tarde...`
- À noite → `Incluindo estratégia para as suas noites...`
- Na madrugada → `Incluindo estratégia para as madrugadas de mamada...`
- Ansiosa ou cansada → `Incluindo estratégia para os momentos de ansiedade e cansaço...`

**Linha de tempo de preparo** (etapa 14):
- Menos de 15 minutos → `Montando refeições de menos de 15 minutos...`
- 15 a 30 minutos → `Montando refeições de 15 a 30 minutos...`
- Até 1 hora → `Montando refeições práticas para a sua rotina...`

Se alguma resposta estiver ausente (usuária voltou/pulou), usar a linha genérica: `Identificando alimentos ideais para você...`

### 7.4 Ordem dinâmica dos bônus (etapa 25b)

O item **"Plano Alimentar Para Lactantes"** sempre vem primeiro. Entre os 4 bônus, o que combina com a resposta dela vai para o topo:

| Resposta | Bônus que sobe para 1º lugar |
|---|---|
| Etapa 11: 🍫 Fome e compulsão por doces | Aula Silenciando a Fome Emocional |
| Etapa 11: ⏰ Não tenho tempo pra cozinhar **ou** etapa 14: ⚡ Menos de 15 minutos | Lista de Compras + Marmitas de 15 Minutos |
| Etapa 11: ❓ Não sei o que posso comer | Lista de Compras + Marmitas de 15 Minutos |
| Etapa 11: 📉 Tento, mas o peso não cai | Guia Perdendo Medidas em 20 Passos Sem Dieta Radical |
| Sem correspondência | Ordem padrão da seção 8.4 |

Se mais de uma regra se aplicar, a regra da **etapa 11** tem prioridade. Os demais bônus mantêm a ordem padrão.

---

## 8. Etapa 25 — Oferta final (nova estrutura e copy)

### 8.1 Ordem dos blocos

1. Título e subtítulo (como hoje)
2. **Recap das respostas** *(novo)*
3. 25a — Aviso APLV (condicional, como hoje)
4. **Mini bio da nutricionista** *(novo, antes do preço)*
5. 25b — Super Oferta + Bônus
6. 25c — Plano Básico
7. 25d — Garantia
8. 25e — Mais prova social (sem os textos ocultos)
9. 25f — "Resumindo..." (manter, incluindo a frase de última vez)
10. 25g — Quem sou eu (bio completa, manter)

### 8.2 Recap das respostas (novo)

- **Título do bloco:** 📋 O que você nos contou, `{nome}`
- **Linhas** (mostrar só as que tiverem resposta; máximo 6 linhas):
  - 🤱 Amamentando há `{tempo da etapa 6, em texto: "menos de 1 mês" / "1 a 3 meses" / "3 a 6 meses" / "mais de 6 meses"}`
  - 🎯 `{diferença}` kg para chegar aos seus `{peso desejado}` kg *(só se diferença > 0)*
  - 🚧 Maior trava: `{resposta da etapa 11 sem o emoji}`
  - 🕐 Momento mais difícil: `{resposta da N4 sem o emoji}`
  - ⏱️ Tempo na cozinha: `{resposta da etapa 14 sem o emoji}`
  - 🍼 Seu bebê tem APLV: versão adaptada incluída *(só se APLV sim ou suspeita)*
- **Fechamento do bloco:** O seu Plano Alimentar Para Lactantes foi montado para esse perfil. 👇

### 8.3 Mini bio (novo, logo antes do card de preço)

- Foto de perfil da Ákila (a mesma da 25g, em tamanho menor)
- **Texto:**
  > **Ákila Samara**, nutricionista (CRN/9 29522). Passei 8 meses com 8 kg acima do peso depois da gestação, presa num ciclo de compulsão. Reorganizei minha rotina e minha alimentação e eliminei 10 kg em 3 meses. Montei este plano para você passar por isso com menos dor.

### 8.4 Card Super Oferta + Bônus (25b)

Manter tag, título, subtítulo, condições, botão e microcopy. Alterar **apenas** a lista de itens e o preço riscado:

- ✓ Plano Alimentar Para Lactantes *(dinâmico: "(+ Versão APLV)" se houver APLV)*
- ✓ Guia de Saladas Saciantes em 10 Minutos — R$97
- ✓ Guia Perdendo Medidas em 20 Passos Sem Dieta Radical — R$197
- ✓ Lista de Compras + Marmitas de 15 Minutos — **R$97** *(NOVO)*
- ✓ Aula Silenciando a Fome Emocional — R$237 *(antes "Consultoria")*
- ✓ Aula Quebrando o Ciclo da Autossabotagem — R$297 *(antes "Consultoria")*

**Removido:** Consultoria Construindo Metas Que Cabem na Sua Rotina (R$247).

**Preço riscado:** ~~De R$1.075~~ → **De R$925** (97 + 197 + 97 + 237 + 297 = 925).
**Preço:** R$19,90 *(sem mudança)*

*(Os bônus mantêm o nome sem dois pontos: "Aula Silenciando...", não "Aula: Silenciando...".)*

### 8.5 Plano Básico (25c)

- Tag: Plano básico sem bônus
- Lista:
  - Plano Alimentar Para Lactantes ✅
  - **Acesso por 1 ano** ⚠️ *(antes "Acesso por 7 dias")*
  - Sem suporte, sem bônus, sem acompanhamento ❌
- Preço: R$10,90
- Botão: Começar só com o básico (resultados mais lentos)

---

## 9. Modal de retenção (25h)

- **Título:** Pegue o seu desconto!
- **Texto:** Receba agora um desconto especial na Super Oferta para levar as aulas, acesso vitalício, os bônus exclusivos e muito mais... Seja rápida e aproveite agora!
  *(trocou "participar das mentorias" por "levar as aulas", para ficar consistente com a renomeação dos bônus)*
- **Preço "de":** De **R$925** aproveite agora por apenas...
- **Preço "por":** R$19,90
- **Botão 1:** Quero o mais completo com desconto agora!
- **Botão 2:** Quero apenas o básico sem desconto e sem presentes

---

## 10. Verificação final (faça antes de encerrar)

1. `grep` final: não deve restar `1.075`, `1075`, `Consultoria` (nos bônus renomeados), `7 dias` (no plano básico), `[OCULTO]`, `[Depoimento`, `[Resultado real` nem a frase "Uma paciente aumentou".
2. Contagem de etapas: o quiz deve ter **29 telas** (incluindo abertura, loading e oferta). A barra de progresso deve avançar corretamente de 0 a 100% sem saltos.
3. Percorra o quiz inteiro, no mínimo nestes cenários, e confirme que não há erros no console:
   - **A)** APLV "Sim", sono "Menos de 4h", momento "À noite", etapa 11 "Fome e compulsão por doces", etapa 14 "Menos de 15 minutos", peso 80 → meta 60, prazo 4 semanas.
   - **B)** APLV "Não", sono "6 horas ou mais", momento "Quando estou ansiosa", etapa 11 "Não tenho tempo pra cozinhar", peso 65 → meta 60, prazo 4 meses.
   - **C)** N1 com "Ainda não tentei nada"; peso desejado maior ou igual ao atual (deve mostrar "Ajuste o peso desejado...").
4. Confirme em cada cenário:
   - o botão **Voltar** funciona nas etapas novas e preserva as respostas;
   - a mensagem de **prazo realista** da etapa 20 aparece só quando necessário (cenário A deve ativá-la: 20 kg em 4 semanas);
   - a **data final** da etapa 24 bate com a da mensagem da etapa 20;
   - o **loading** mostra as linhas dinâmicas corretas;
   - o **recap** da oferta mostra só as linhas com resposta;
   - os **bônus** reordenam conforme a seção 7.4 (A: Fome Emocional primeiro; B: Marmitas primeiro);
   - **nenhum** texto oculto/placeholder aparece;
   - toasts, contador, aviso de escassez e checkout continuam funcionando como antes.
5. Entregue um resumo curto do que foi alterado, listando arquivos e as funções/variáveis novas.

---

## 11. Pontos para a cliente confirmar (não bloqueiam a implementação)

Anote no resumo final, sem alterar nada além do especificado:

- **Ritmo máximo de 1 kg/semana** (`RITMO_MAX_KG_SEMANA`): é o valor sugerido pela nutricionista (4 kg/mês). Ela deve confirmar; o ritmo usualmente recomendado na lactação costuma ser menor. Está em uma constante para ajustar fácil.
- **Reação da N4** ("Seu plano vai ter uma estratégia para esse momento"): só é verdadeira se o plano realmente trouxer lanches/estratégias para esses horários. Confirmar com a nutricionista.
- **Plano Básico com 1 ano de acesso:** o código só muda o texto. A duração real precisa ser configurada no produto/plataforma de vendas.
- **Bônus "Aula ..." (antes "Consultoria"):** se houver atendimento individual real, voltar ao nome "Consultoria" e explicar como funciona.
- **Aviso opcional para pós-parto muito recente:** quando a etapa 6 for "Menos de 1 mês", considerar uma mensagem curta como "Nos primeiros dias, siga a orientação do seu médico". *Não implementar sem confirmação.*
- **Frase opcional no modal:** "Você está a apenas R$9 de levar tudo". *Não implementar sem confirmação.*
- **Microcopy da abertura** foi ajustada de "Apenas 2 minutos" para "Cerca de 3 minutos", porque o quiz agora é mais longo. Se quiserem outro tempo, é só trocar o texto.
