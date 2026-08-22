# Spec: Quiz de Vendas - Plano Alimentar Para Lactantes

## 0. Decisões confirmadas com a cliente

Todos os pontos que estavam em aberto na primeira versão desta spec já foram confirmados. Registro aqui pra rastreabilidade, não precisa mais revisar isso, já pode seguir direto pro Claude Code.

1. **Nome do produto:** "Plano Alimentar Para Lactantes". Confirmado.
2. **Valores do stack de bônus** (Etapa 25): confirmados, ver Etapa 25b. Total de bônus riscado: R$1.075.
3. **"Acesso por 7 dias" no plano básico R$10,90:** confirmado, mantém.
4. **Contador de "X mamães testando agora"** na etapa de abertura: número aleatório, sorteado dentro da faixa 140 a 160, confirmado.
5. **Notificações de compra fake:** nomes e cidades fictícios novos, confirmado.
6. **Ilustrações "Tipo 1 a Tipo 4"** (Etapa 2, corpo em imagem): confirmado como placeholder de imagem, entram depois (banco de imagem licenciado ou ilustração própria, fora do escopo deste projeto de código).

## 1. Contexto e objetivo

Quiz de vendas pra tráfego direto (anúncio leva direto pro quiz, sem página de captura antes). Objetivo: qualificar a lead, gerar personalização percebida, e converter no final pro checkout do Plano Alimentar Para Lactantes.

A estrutura (etapas, ordem, tipo de pergunta, mecânica) é modelada em um quiz validado de terceiro. O texto de promessa, a oferta, os valores e a marca são inteiramente nossos. Isso está detalhado etapa por etapa na seção 5, com marcação clara do que é cópia estrutural e do que é conteúdo novo.

## 2. Produto e oferta (já validada, não renegociar aqui)

**Promessa (headline + subheadline), aprovada e travada:**
> Elimine os quilos da gestação sem atrapalhar a amamentação
> Sem cortar sua energia, sem dietas restritas e sem precisar de tempo que você não tem. Um cardápio feito por nutricionista especializada em lactantes.

**Preços:**
- Plano Básico: R$10,90 (só o cardápio, sem bônus)
- Super Oferta: R$19,90 (cardápio + todos os bônus)

**Bônus (Super Oferta):**
1. Guia de Saladas Saciantes em 10 Minutos
2. Guia Perdendo Medidas em 20 Passos Sem Dieta Radical
3. Consultoria Construindo Metas Que Cabem na Sua Rotina
4. Consultoria Silenciando a Fome Emocional
5. Consultoria Quebrando o Ciclo da Autossabotagem

**Order bumps** (fora do escopo deste quiz, entram na página de checkout, não no quiz):
1. Plano Alimentar do Bebê para os 6 Primeiros Meses Sem Dúvidas - R$19
2. Manual Emagrecendo Depois da Amamentação - R$17
3. Guia de Lanches Anti-Fome Entre as Mamadas - R$12
4. Guia de Doces Fit Que Não Sabotam Seu Emagrecimento - R$14
5. Combo com desconto (leve todos) - R$29

**Checkout:** ainda não temos o link. Deixar constante/placeholder isolada (ex: `CHECKOUT_URL` no topo do arquivo principal) fácil de trocar depois.

## 3. Princípios de copy, obrigatórios em toda a interface

- Nunca usar travessão (—) em nenhum texto visível pro usuário. Trocar por vírgula, ponto, ou frase separada.
- Nunca prometer número fixo de emagrecimento por semana (ex: "-2kg por semana", "-7 a -11kg"). Onde o quiz original usa isso, substituir por linguagem de ritmo seguro (ex: "no ritmo seguro pra quem amamenta", "sem pressa, sem comprometer o leite"). Está marcado em cada etapa onde isso se aplica.
- Tom: caloroso, direto, sem jargão médico, escrito como se estivesse falando com uma amiga cansada, não como um folheto clínico.

## 4. Requisitos técnicos

- HTML, CSS e JS puro. Sem framework, sem build step, sem dependência de npm. Isso é decisão fechada, não é sugestão.
- Mobile-first: a maior parte do tráfego direto de anúncio entra por celular, o layout desktop é secundário.
- Leve e rápido: cada segundo de carregamento a mais derruba conversão em quiz de anúncio. Evitar imagens pesadas não otimizadas, evitar bibliotecas externas desnecessárias.
- Estrutura de arquivos, nomes de variável, organização de CSS/JS: decisão livre sua, sem restrição daqui.
- Progresso do quiz: barra de progresso no topo, incrementando a cada etapa, com botão "Voltar" nas etapas que tiverem (ver seção 5).
- Estado: guardar respostas do usuário em memória (JS), usado depois pra personalizar nome, IMC, meta calculada e texto dinâmico nas etapas finais.

## 5. Identidade visual

Trocar cor e tipografia do original (que é laranja/branco, fonte serifada no título + sans no corpo). Direção pedida: manter a mesma sensação de acolhimento e confiança, mas com paleta própria, não replicar o laranja do concorrente. Sugestão de direção (não obrigatória, você decide os valores exatos): tons suaves e maternos, algo como rosa queimado, verde-sálvia ou terracota, com neutro quente de fundo, evitando parecer clínico/frio. Se a nutricionista já tiver cor de marca definida (Instagram, logo), usar essa como base é melhor que inventar uma nova, isso fica a critério de quem for implementar.

## 6. Estrutura completa do quiz (26 etapas)

Legenda: 🟢 copiar estrutura e texto como está | 🟡 copiar estrutura, trocar texto (modelagem) | 🔴 copiar estrutura, conteúdo de imagem/depoimento é placeholder | ⚙️ etapa com lógica/cálculo

### Etapa 0 - Abertura 🟡
- Contador social no topo: "[N] mamães testando o Plano Alimentar Para Lactantes agora" (N = número aleatório, sorteado a cada carregamento de página dentro da faixa 140 a 160)
- Headline: "Elimine os quilos da gestação sem atrapalhar a amamentação"
- Subheadline: "Sem cortar sua energia, sem dietas restritas e sem precisar de tempo que você não tem. Um cardápio feito por nutricionista especializada em lactantes."
- Imagem de produto (mockup celular + papel do cardápio). Placeholder de imagem.
- 3 selos: "+20 mil mães" · "100% Natural" · "Mantém o Leite" (ajustar "+20 mil" se o número real for outro, ela confirma depois)
- Box de aviso: "Esta avaliação está disponível somente uma vez por pessoa. Se sair agora, você pode perder sua oportunidade."
- Botão CTA: "Quero meu Cardápio Personalizado!"
- Microcopy abaixo do botão: "Diagnóstico Grátis · Apenas 2 minutos"

### Etapa 1 - Idade 🟢
Pergunta: "Qual é a sua idade?" / subtítulo: "Isso ajuda a calibrar seu metabolismo corretamente"
Opções (single-select): 18 a 24 anos / 25 a 29 anos / 30 a 34 anos / 35 a 39 anos / 40 anos ou mais. Cada uma com ícone e subtítulo curto sobre metabolismo (texto livre, mantendo o tom positivo do original).

### Etapa 2 - Corpo, ilustração 🔴
Pergunta: "Como você descreveria seu corpo hoje?" / subtítulo: "Selecione a opção que mais te descreve"
4 opções (Tipo 1 a Tipo 4), cada uma com ilustração de corpo feminino em pose neutra, do mais cheio ao mais magro. Imagens são placeholder, ver item 6 das suposições no topo.

### Etapa 3 - O que quer mudar 🟢
Pergunta: "O que você quer realmente mudar agora?" / subtítulo: "Escolha a opção que mais se adapta a você"
Opções: Emagrecer de uma vez e queimar gordura / Parar de recuperar tudo que emagreci / Voltar a me sentir firme e confiante / Ter mais energia para curtir meu bebê / Emagrecer sem comprometer meu leite

### Etapa 4 - Corpo, texto 🟢
Pergunta: "Como você descreveria seu corpo hoje?" / subtítulo: "Seja honesta, isso personaliza sua solução"
Opções: Tenho gordura acumulada que não consigo eliminar / Fico inchada com facilidade e me sinto pesada / Controlo a alimentação, mas o peso não cai / Sinto que meu metabolismo está completamente travado

### Etapa 5 - Partes do corpo 🟢
Pergunta: "Em que partes do corpo você sente mais dificuldade?" / subtítulo: "Pode selecionar mais de uma opção"
Multi-select: Barriga / Abdômen · Braços · Quadril e glúteos · Pernas e coxas · No corpo todo
Botão: "Continuar →"

### Etapa 6 - Tempo amamentando 🟢
Pergunta: "Há quanto tempo você está amamentando?" / subtítulo: "Isso personaliza o seu cardápio"
Opções: Menos de 1 mês / 1 a 3 meses / 3 a 6 meses / Mais de 6 meses

### Etapa 7 - Peso acima do ideal 🟢
Pergunta: "Quanto acima do seu peso ideal você está hoje?" / subtítulo: "Seja honesta, isso personaliza sua solução"
Opções: Até 5 kg / 5 a 10 kg / 10 a 20 kg / Mais de 20 kg

### Etapa 8 - Prova social #1 🔴
Bloco "Mães Reais. Resultados Reais." com 3 casos de antes/depois, cada um com: foto antes/depois, tag de resultado ("-X kg em Y semanas"), depoimento em aspas, nome/idade/cidade.
Botão final: "Continuar minha avaliação →"
Conteúdo (foto, resultado, depoimento, nome): placeholder, entram pacientes reais dela depois. Não usar os casos do quiz original de jeito nenhum, nem como texto de exemplo, pra evitar risco de ficar no código por engano.

### Etapa 9 - Captura de nome 🟢
"Para personalizar seu cardápio, como podemos te chamar?" / subtítulo: "Usaremos seu nome para deixar sua avaliação 100% personalizada. Zero spam."
Campo de texto: primeiro nome
Botão: "Começar minha avaliação →"
A partir daqui, usar `{nome}` capturado para personalizar as próximas telas onde o original faz isso.

### Etapa 10 - Como se sente no pós-parto 🟢
Pergunta: "{nome}, como você está se sentindo no pós-parto?" / subtítulo: "Selecione o que mais se aplica a você"
Opções: Exausta e sem energia / Frustrada com meu corpo / Com fome o tempo todo / Com medo de perder o leite

### Etapa 11 - O que travou resultados 🟢
Pergunta: "O que mais tem travado seus resultados?" / subtítulo: "Escolha a opção mais próxima da sua realidade"
Opções: Tento, mas o peso não cai / Fome e compulsão por doces / Não tenho tempo pra cozinhar / Não sei o que posso comer

### Etapa 12 - Bloco educacional + depoimento 🟡🔴
Bloco de texto: "Por que você não consegue emagrecer na amamentação com dietas normais". Conteúdo: explica que restrição calórica brusca ativa cortisol, retém gordura e pode reduzir produção de leite, e que o Plano Alimentar Para Lactantes foi desenhado pra aumentar produção de leite e acelerar queima de gordura sem passar fome. (🟡 trocar nome do produto, manter a lógica do argumento, que é boa e não tem número fixo)
Abaixo, print de depoimento (Instagram ou WhatsApp) real de paciente. (🔴 placeholder)
Botão: "Continuar minha avaliação →"

### Etapa 13 - "Por que algumas mães emagrecem fácil" 🟡🔴
Headline: "Por que algumas mães emagrecem fácil enquanto você luta para perder qualquer quilo?"
Tag: "Menos inchaço, resultado real"
Foto antes/depois (🔴 placeholder)
Texto: explica que dieta restritiva no pós-parto retém líquido e acumula inflamação por cortisol elevado, sono ruim e alimentação desajustada, resultado: peso travado mesmo "fazendo tudo certo". Fecha com: "Com o Plano Alimentar Para Lactantes, você ajusta tudo por etapas: desinflamar, equilibrar o metabolismo e emagrecer no ritmo seguro sem sacrificar o leite." (🟡 sem número fixo aqui, ao contrário do original que usa "-2kg por semana")
Botão: "Continuar →"

### Etapa 14 - Tempo pra preparar refeições 🟢
Pergunta: "Quanto tempo você tem para preparar suas refeições?" / subtítulo: "Seu cardápio será adaptado à sua rotina"
Opções: Menos de 15 minutos / 15 a 30 minutos / Até 1 hora

### Etapa 15 - APLV 🟢
Pergunta: "Seu bebê tem APLV (Alergia à Proteína do Leite de Vaca)?" / subtítulo: "Temos uma versão especial para APLV"
Opções: Sim, meu bebê tem APLV / Não, não temos APLV / Ainda não sei, suspeito
Confirmado: ela tem versão do cardápio sem leite de vaca, então essa etapa fica exatamente como está. A resposta aqui decide se a Etapa 25 mostra o aviso de "Versão APLV disponível".

### Etapa 16 - Peso atual ⚙️🟢
Pergunta: "Qual é o seu peso atual?" / subtítulo: "Seja honesta para um resultado preciso"
Slider numérico, padrão 70kg, intervalo 40 a 150kg, botões -5/-/+/+5

### Etapa 17 - Altura ⚙️🟢
Pergunta: "Qual é a sua altura?" / subtítulo: "Usamos isso para calcular seu IMC"
Slider numérico, padrão 165cm, intervalo 140 a 200cm

### Etapa 18 - Peso que se sentiria bem ⚙️🟢
Pergunta: "Qual é o peso com que você se sentiria bem?" / subtítulo: "Qual é o seu peso dos sonhos?"
Slider numérico, padrão 60kg, intervalo 40kg até (peso atual − 1kg)
Texto calculado dinamicamente abaixo do slider: "Meta: emagrecer {peso_atual − peso_desejado} kg"
Botão: "Ver meu Resultado →"

### Etapa 19 - Ocasião especial 🟢
Tag: "Pergunta extra"
Pergunta: "{nome}, tem alguma ocasião especial que está te motivando?" / subtítulo: "Fixar uma data clara aumenta muito a motivação"
Opções: Casamento / Viagem ou férias / Volta ao trabalho / Aniversário, comemoração / Foto especial com meu bebê / Quero me sentir bem comigo mesma / Nenhuma específica

### Etapa 20 - Prazo do objetivo 🟡
Tag: "Última etapa"
Pergunta: "Em quanto tempo você quer atingir seu objetivo?" / subtítulo: "Isso vai calcular sua projeção personalizada"
Opções: 4 semanas (resultado rápido) / 2 meses (ritmo constante) / 3 meses (sustentável) / 4 meses (com calma)
Box final: "Com o Plano Alimentar Para Lactantes, mães lactantes emagrecem no ritmo seguro, de forma saudável e mantendo o leite." (🟡 troca o "-2kg por semana" do original por essa linha, sem número fixo)

### Etapa 21 - Resultado, projeção ⚙️🟡
Header destacado: "Com base no seu diagnóstico... Prevemos que você pesará {peso_desejado} kg até {data calculada}!"
Sub: "Boa notícia! Sua meta é alcançável"
Gráfico de linha: peso atual (hoje) até peso meta, distribuído ao longo do prazo escolhido na Etapa 20, com 2 a 3 pontos intermediários
Texto abaixo: "Seguindo o Plano Alimentar Para Lactantes, {nome} pode chegar em {ocasião especial escolhida, se houver} com o corpo que deseja sem parar de amamentar e sem dietas restritivas!"
Botão: "Ver meu Cardápio Completo →"

**Regra de cálculo obrigatória (🟡 diferente do original):** o gráfico não pode implicar um ritmo de perda de peso acima de aproximadamente 1kg por semana, mesmo que o prazo escolhido pela usuária na Etapa 20 e a diferença de peso levem a uma conta mais rápida. Se o pedido da usuária implicar ritmo mais agressivo que isso, a curva do gráfico deve se ajustar (desacelerando no fim, ou reconhecendo que o prazo pode se estender um pouco) em vez de mostrar uma perda semanal irreal. Isso existe porque perda de peso acima desse ritmo amamentando é normalmente associada a risco pra produção de leite, e contradiria a própria promessa do produto.

**A partir desta etapa até o final do quiz:** ativar notificação de compra fake, aparecendo a cada 2 a 3 segundos, formato toast/popup no canto, com nome + cidade + "acabou de comprar o Plano Alimentar Para Lactantes! Plano Completo". Usar uma lista rotativa de uns 10 nomes/cidades fictícios (não reaproveitar nomes do quiz original). Deixar essa lista isolada em uma constante/array fácil de editar depois.

### Etapa 22 - Prova social #2, conversas 🔴
Sequência de prints de conversa (WhatsApp ou Instagram) mostrando trocas reais entre a nutricionista e pacientes sobre o resultado do cardápio. Formato: bolha de mensagem, com trecho em destaque tipo "citação" logo abaixo de cada print.
Conteúdo: placeholder, entram conversas reais dela depois.

### Etapa 23 - Loading, gerando cardápio 🟢🔴
Título: "Gerando seu Cardápio Personalizado..."
Barra de progresso animada de 0 a 100%
4 itens de checklist aparecendo em sequência conforme a barra avança: "Analisando suas respostas..." / "Calculando seu IMC e perfil..." / "Identificando alimentos ideais para você..." / "Montando seu cardápio exclusivo..."
Perto do final (por volta de 70-95%), aparece foto antes/depois com tag "Resultado Verificado" e depoimento curto. (🔴 placeholder de foto/depoimento)
Duração sugerida: 4 a 6 segundos, não precisa ser mais longo que isso.

### Etapa 24 - Perfil nutricional e previsão ⚙️🟡
Header: "Com base no seu perfil... você pode emagrecer no ritmo seguro nas próximas semanas com o Plano Alimentar Para Lactantes" (🟡 troca a faixa fixa "-7 a -11 kg" do original)
Bloco IMC: barra visual Abaixo/Saudável/Sobrepeso/Obesidade + valor calculado a partir de peso e altura das Etapas 16 e 17
Bloco "Seu Perfil Nutricional": Objetivo / Meta de emagrecimento (calculada) / Perfil metabólico (texto livre baseado nas respostas) / Versão do cardápio (mostrar "Cardápio + Versão APLV" se a Etapa 15 foi respondida "Sim" ou "Ainda não sei")
Bloco "Taxa de queima de gordura": barra visual + comparação "Sem Cardápio" vs "Com Cardápio" (fome constante/leite diminuindo/peso travado/cansaço extremo vs saciedade real/leite abundante/energia de volta/controle do apetite. Não incluir "-2kg/semana" nessa lista, usar "progresso constante" ou similar)
Bloco "Previsão personalizada": texto "{nome}, prevemos que você atingirá seu peso ideal de {peso_desejado} kg até {data}" + gráfico simples (mesma regra de ritmo seguro da Etapa 21)
Botão: "Ver meu Cardápio Personalizado →"

### Etapa 25 - Oferta final (etapa composta) 🟡🔴
Esta é a etapa mais longa do quiz, junta várias seções na mesma página, role contínuo.

**25a. Aviso condicional APLV:** se a Etapa 15 = "Sim" ou "Ainda não sei", mostrar box: "Versão APLV Disponível! Como seu bebê tem APLV, seu plano inclui a versão adaptada para APLV sem proteína do leite de vaca, com toda a nutrição necessária para você e seu bebê."

**25b. Card Super Oferta R$19,90:**
- Tag: "Mais escolhido · Melhor custo-benefício"
- Título: "Super Oferta + Bônus"
- Subtítulo: "O caminho mais rápido para emagrecer sem parar de amamentar"
- Lista do que está incluso. Seguindo o padrão da referência, o item principal (o plano alimentar) não leva valor riscado ao lado, só os bônus levam:
  - Plano Alimentar Para Lactantes (+versão APLV se aplicável), sem valor riscado
  - Guia de Saladas Saciantes em 10 Minutos - R$97
  - Guia Perdendo Medidas em 20 Passos Sem Dieta Radical - R$197
  - Consultoria Construindo Metas Que Cabem na Sua Rotina - R$247
  - Consultoria Silenciando a Fome Emocional - R$237
  - Consultoria Quebrando o Ciclo da Autossabotagem - R$297
- Total riscado: De R$1.075
- Preço: R$19,90 · "Pagamento único · Acesso vitalício · Atualizações inclusas"
- Botão: "Quero o plano completo com todos os bônus →"
- Microcopy: "Pague uma vez e tenha acesso para sempre"

**25c. Card Plano Básico R$10,90:**
- Tag: "Plano básico sem bônus"
- Lista: Plano Alimentar Para Lactantes ✅ / Acesso por 7 dias ⚠️ (ver suposição 3 no topo) / Sem suporte, sem bônus, sem acompanhamento ❌
- Preço: R$10,90
- Botão: "Começar só com o básico (resultados mais lentos)"
- Ao clicar neste botão, abrir o popup de retenção (25f)

**25d. Garantia:** "Garantia de 90 dias na Super Oferta. Risco ZERO. Se você não gostar do Cardápio, basta pedir o seu dinheiro de volta."

**25e. Mais prova social:** repetir formato da Etapa 8 (fotos antes/depois + depoimentos) e trecho de Instagram Stories/comentários. (🔴 placeholder, pacientes reais dela)

**25f. Bloco "Resumindo...":**
"Pode ser a última vez que você acessa esta página, então sugiro que faça sua inscrição e tenha acesso imediato. A proposta é simples e clara: você vai aprender na prática como seguir um cardápio especial que ajuda mães lactantes a emagrecerem de forma saudável e segura, enquanto mantêm uma produção de leite adequada e cuidam do seu bebê. Você não precisa: Fazer dietas restritivas / Gastar muito dinheiro com alimentos caros / Abrir mão dos alimentos que você ama. Acho justo você ver por dentro e se não gostar, devolvo o seu investimento. Tudo que você precisa fazer agora é clicar no botão abaixo para ter acesso a TUDO que você viu."
Botão: "Quero garantir meu acesso agora →"

**25g. Bio "Quem sou eu?":** 🔴 PENDENTE, não escrever texto nenhum aqui, deixar bloco vazio com comentário `<!-- AGUARDANDO BIO REAL DA NUTRICIONISTA -->` no lugar do texto e da foto. Não inventar formação, história ou nome de família.

**25h. Popup de retenção (abre ao clicar no botão do Plano Básico R$10,90):**
Título: "Pegue o seu desconto!"
Texto: "Receba agora um desconto especial na Super Oferta para participar das mentorias, acesso vitalício, os bônus exclusivos e muito mais... Seja rápida e aproveite agora!"
Preço: "De R$1.075 aproveite agora por apenas... R$19,90"
Botão principal: "Quero o mais completo com desconto agora!"
Botão secundário (texto, sem destaque): "Quero apenas o básico sem desconto e sem presentes"

## 7. Placeholders de imagem

Criar uma pasta `/assets/placeholders/` com um arquivo por posição, nomeado de forma descritiva, por exemplo:
- `etapa02-corpo-tipo1.png` até `etapa02-corpo-tipo4.png`
- `etapa08-antes-depois-01.jpg`, `-02.jpg`, `-03.jpg`
- `etapa12-print-depoimento.jpg`
- `etapa13-antes-depois.jpg`
- `etapa22-print-conversa-01.jpg` até `-04.jpg` (ajustar quantidade conforme o layout que você construir)
- `etapa23-antes-depois.jpg`
- `etapa25-antes-depois-01.jpg` em diante
- `etapa25-bio-foto.jpg`

Cada placeholder deve ser visualmente óbvio no navegador (caixa cinza clara com o nome do arquivo escrito dentro, não deixar espaço em branco ou quebrado), pra facilitar a substituição depois.

**Ao terminar o projeto, a última coisa que você deve fazer é imprimir no terminal (ou criar um arquivo `LEIA-ME-IMAGENS.md` na raiz) uma lista de todos os arquivos em `/assets/placeholders/`, explicando em uma linha o que cada um precisa ser, e confirmando que é só substituir o arquivo mantendo o mesmo nome pra imagem real aparecer no lugar certo.**

## 8. Conteúdo pendente, não inventar

Dois textos ainda não foram entregues pela cliente: a bio da nutricionista (Etapa 25g) e a confirmação se ela tem uma história pessoal de perda de peso pós-parto pra reaproveitar aquele bloco, ou se ele deve virar algo sobre a experiência das pacientes em geral. Nenhum dos dois deve ser preenchido com texto inventado, nem como exemplo "de mentira pra ilustrar". Deixar claramente marcado como pendente no código.

## 9. O que não fazer

- Não copiar as ilustrações de corpo (Etapa 2) do quiz original, é arte de terceiro.
- Não usar nenhuma foto, print de depoimento ou conversa do quiz original em lugar nenhum, nem como placeholder temporário, pra não arriscar ir parar em produção por engano.
- Não reintroduzir número fixo de emagrecimento por semana em nenhum texto (nem no gráfico, nem em bullet, nem em comparação "sem cardápio vs com cardápio").
- Não usar travessão em texto de interface.
- Não adicionar telas, perguntas ou etapas que não estão listadas na seção 6.

## 10. Fora de escopo deste quiz

- Link de checkout real (placeholder por enquanto)
- Upsell e downsell pós-compra (não fazem parte do quiz, ficam pra depois, em outro projeto)
- Integração com pixel de anúncio, analytics, ou plataforma de e-mail marketing (se for necessário depois, é outro pedido)
