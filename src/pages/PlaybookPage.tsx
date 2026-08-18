import { useEffect, useState } from 'react'
import { getCurrentUserProfile } from '../lib/auth'

// ─── Constants ───────────────────────────────────────────────────────────────
const GOLD = '#C9A050'
const VIOLET = '#7B6FD4'
const TEXT_LIGHT = '#F0F0F0'
const TEXT_DIM = '#888888'
const WHATSAPP_NUMBER = '5561991734974'
const STORAGE_KEY = 'ocm_playbook_progress'

// ─── Types ────────────────────────────────────────────────────────────────────
type PillarKey = 'dominio' | 'cultivar' | 'guardar' | 'liderar'
type Stage = 'dashboard' | 'week' | 'finalQuiz' | 'finalResult'

interface DayData {
  day: number
  title: string
  theory: string
  exercise: string
  reflection: string
}

interface PillarInfo {
  name: string
  color: string
  week: string
  description: string
  days: DayData[]
}

interface DayProgress {
  completed: boolean
  reflection: string
}

type PillarProgress = Record<number, DayProgress>
type WeekProgress = Partial<Record<PillarKey, PillarProgress>>

// ─── Pillar Data ──────────────────────────────────────────────────────────────
const pillarOrder: PillarKey[] = ['dominio', 'cultivar', 'guardar', 'liderar']

const pillarData: Record<PillarKey, PillarInfo> = {
  dominio: {
    name: 'DOMÍNIO PRÓPRIO',
    color: GOLD,
    week: 'SEMANA 1',
    description: 'Auto-respeito, padrão pessoal, consistência quando ninguém vê',
    days: [
      { day: 1, title: 'O Padrão Que Você Sustenta Sozinho', theory: 'Você quer ser diferente. Nunca decidiu como. Todo homem sonha com disciplina. Poucos escolhem o primeiro minuto do dia. Provérbios é direto: quem não controla o espírito é cidade derrubada, sem muralhas. Sem muro, qualquer vento entra. Domínio próprio não nasce pronto. Se escolhe, minuto a minuto, longe de plateia.', exercise: 'Hábito não é meta, é identidade. Cada ato vota em quem você é. Hoje, escolha 1 ato que representa o homem que você quer ser: treino, oração, leitura, ou atenção real à família. Faça isso antes de abrir o celular. Feche em oração: peça força pra sustentar amanhã.', reflection: 'Qual ato você escolheu e por que ele representa quem você quer ser?' },
      { day: 2, title: 'O Teste do Meio do Dia', theory: 'Toda manhã disciplinada tem um endereço. Chega ao meio-dia. É ali que o padrão quebra. O cansaço bate. A vontade esfria. Ninguém mais está aplaudindo. Gálatas chama isso de fruto do Espírito: domínio próprio, não performance de manhã. Fruto amadurece sob pressão, não em vitrine.', exercise: 'Às 12h, pare por 2 minutos. Pergunte: mantive meu padrão até agora? Responda sem se justificar. Se falhou, não invente desculpa, assuma e retome agora mesmo. Peça a Deus 1 frase: me ajuda a terminar o dia como comecei.', reflection: 'Qual foi sua resposta honesta ao meio-dia?' },
      { day: 3, title: 'A Volta Rápida', theory: 'Você não lembra do dia perfeito. Lembra de quando voltou rápido. Nenhum homem sustenta um padrão sem falha. O que separa quem cresce de quem trava é a velocidade da volta. Lucas 16 ensina: fiel no pouco, fiel no muito. Fidelidade não é perfeição. É retomar rápido, sem se afogar em culpa.', exercise: 'À noite, antes de dormir, responda: que pequena coisa fiz bem hoje, sozinho, sem ninguém saber? Anote em 1 frase. Agradeça a Deus por essa vitória pequena. Amanhã, comece de novo.', reflection: 'Qual foi essa coisa?' },
      { day: 4, title: 'Impulso vs. Escolha', theory: 'Homem que só reage cria hábito, não caráter. Impulso é automático. Reage ao ambiente, sem pensar. Escolha é diferente. Responde a uma identidade que você decidiu sustentar. Domínio próprio, na Bíblia, é fruto, não reação. Fruto cresce devagar, escolha por escolha.', exercise: 'Hoje, identifique 1 impulso: redes sociais, comida fácil, procrastinação. Rejeite conscientemente, sem negociar com você mesmo. Sinta o desconforto e não fuja dele. Ore assim: me dá força pra escolher, não só reagir.', reflection: 'Qual impulso você rejeitou e como foi o momento da escolha?' },
      { day: 5, title: 'Quem Você É Na Ausência de Plateia', theory: 'Postura de homem bom não substitui caráter, só disfarça vazio. Seu caráter real não é o que você mostra em público. É o que você faz sem plateia, sem elogio, sem risco de julgamento. Essa é a pergunta que separa imagem de identidade: quem você é quando ninguém vê?', exercise: 'Reserve 10 minutos em silêncio hoje, sem celular, sem distração. Responda com profundidade: quando ninguém vê, quem sou eu de verdade? Escreva a resposta, mesmo que doa. Leve isso pra Deus em oração.', reflection: 'Sua resposta sincera:' },
      { day: 6, title: 'Consistência Composta', theory: 'Você quer resultado grande. Nunca sustentou nada pequeno. Um ato isolado não muda homem nenhum. O mesmo ato, repetido, se acumula como juros. O efeito não é linear, é exponencial. Hoje é o teste: você sustentou 5 dias do mesmo padrão?', exercise: 'Repita exatamente o ato que escolheu no Dia 1. Depois, avalie com honestidade: mantive o padrão por 5 dias? Se sim, agradeça. Se não, não desista, retome. Ore: obrigado pelo que já sustentei até aqui.', reflection: 'Como você se sente sustentando esse padrão até aqui?' },
      { day: 7, title: 'O Que Sustenta, Não o Que Motiva', theory: 'Homem que só busca motivação cria recaída, não constância. Motivação é combustível de curto prazo. O que sustenta, no longo prazo, é sistema e identidade. Não é força de vontade renovada todo dia. Domínio próprio consolidado vira a base pra tudo que vem depois: Cultivar, Guardar, Liderar.', exercise: 'Feche a semana respondendo: que ritmo pequeno eu sustentei aqui? O que vou levar comigo pra CULTIVAR? Escreva 1 frase de compromisso. Ore agradecendo pela semana e pedindo força pra próxima.', reflection: 'Qual será seu próximo passo?' },
    ],
  },
  cultivar: {
    name: 'CULTIVAR',
    color: VIOLET,
    week: 'SEMANA 2',
    description: 'Crescimento intencional, investimento em 1 área, progressão',
    days: [
      { day: 1, title: 'Crescer Por Acidente ou Por Intenção', theory: 'Homem que só reage a crise cresce por acidente, não por escolha. A maioria dos homens evolui sem querer, empurrado pelo problema da vez. Gênesis 2:15 diz que Deus colocou o homem no jardim pra cultivar. Cultivar é ação deliberada, não reação. Esta semana, você escolhe 1 área e planta ali, de propósito.', exercise: 'Escolha 1 área para investir nessas 4 semanas: carreira, saúde, casamento, conhecimento. Só uma, não disperse. Ore pedindo clareza: me mostra onde plantar agora.', reflection: 'Por que essa área, e por que agora?' },
      { day: 2, title: 'A Distância Real', theory: 'Você não lembra quanto andou. Lembra só de quanto falta. Isso distorce tudo. Você não fecha uma distância que nunca mediu de verdade. Cultivar exige clareza: onde você está, sem se enganar pra cima nem se diminuir pra baixo. Só depois disso dá pra traçar o caminho.', exercise: 'Mapeie por escrito: onde você está hoje nessa área, e onde quer estar em 90 dias. Seja honesto nos dois pontos. Ore: me dá coragem pra ver a verdade sem me esconder dela.', reflection: 'Qual é a distância real entre os dois pontos?' },
      { day: 3, title: 'O Progresso Mínimo Viável', theory: 'Você quer resultado rápido. Nunca fez os 15 minutos de hoje. Esforço esporádico perde pra ação diária, mesmo pequena. Quinze minutos reais, todo dia, produzem mais do que uma sessão intensa uma vez por mês. Cultivar é constância, não intensidade.', exercise: 'Dedique 15 minutos de ação concreta hoje, nessa área. Não é planejamento, é ação. Cronometre, se precisar. Ore antes de começar: usa esse tempo, mesmo pequeno.', reflection: 'O que você avançou de fato?' },
      { day: 4, title: 'Documentar Para Não Se Enganar', theory: 'Sensação de progresso não substitui progresso, só disfarça estagnação. A mente esquece o avanço lento e lembra só da frustração. Documentar por escrito o que muda, mesmo pouco, protege você do autoengano. Motivação real vem de prova, não de sensação.', exercise: 'Registre por escrito: o que mudou hoje nessa área, por menor que seja? Uma frase basta. Guarde essa prova. Agradeça a Deus por ela, mesmo pequena.', reflection: 'Mesmo pequeno, o que mudou?' },
      { day: 5, title: 'Investir ou Consumir', theory: 'Homem que só consome conteúdo cria opinião, não habilidade. Existe diferença entre assistir sobre uma área e agir nela de verdade. Um alimenta a sensação de progresso. O outro produz progresso real. Cultivar pede prática, não mais teoria.', exercise: 'Avalie com honestidade: nos últimos dias, você estava investindo ou só consumindo? Escolha 1 ação prática pra fazer hoje, não mais um vídeo. Ore pedindo disposição pra agir, não só aprender.', reflection: 'Resposta honesta:' },
      { day: 6, title: 'Ajuste de Rota', theory: 'Toda estratégia velha tem um endereço. Chega no resultado que você já tem. Persistência sem avaliação vira teimosia. Cultivar de verdade exige parar, olhar o que deu certo, e mudar de rota quando os fatos pedem. Sem culpa, sem drama.', exercise: 'Pergunte-se: preciso mudar de estratégia nessa área? Se sim, defina o ajuste agora, por escrito. Ore pedindo sabedoria pra mudar sem desistir do objetivo.', reflection: 'O que precisa ajustar, se precisar?' },
      { day: 7, title: 'Visão de 30 Dias', theory: 'Você quer crescer. Nunca escreveu onde quer chegar. Visão clara funciona como alvo: a atenção se direciona sozinha pra ela. Sem visão escrita, você reage ao acaso. Com ela, cada escolha diária ganha direção. Cultivar sem visão é só esforço perdido.', exercise: 'Escreva como você quer estar nessa área daqui a 30 dias. Seja específico, não genérico. Ore entregando essa visão a Deus: guia meus próximos passos.', reflection: 'Sua visão para os próximos 30 dias:' },
    ],
  },
  guardar: {
    name: 'GUARDAR',
    color: GOLD,
    week: 'SEMANA 3',
    description: 'Proteção, limite, discernimento, o que não deixar entrar',
    days: [
      { day: 1, title: 'O Que Entra Define o Que Você Se Torna', theory: 'Homem que não guarda a entrada cria hábito ruim, não acidente. Você não controla tudo que te atinge. Controla muito do que deixa entrar: informação, companhia, conteúdo. Provérbios manda guardar o coração, porque dele nascem as fontes da vida. O que entra repetido, um dia, sai como caráter.', exercise: 'Faça um inventário hoje: o que está entrando na sua vida que não deveria? Conteúdo, pessoa, hábito. Nomeie sem se desculpar. Ore pedindo discernimento pra guardar a entrada.', reflection: 'O que você identificou?' },
      { day: 2, title: 'Limite é o Preço da Liberdade', theory: 'Educação excessiva não substitui limite, só disfarça medo de dizer não. Sem limite, seu tempo e energia vazam pra prioridade de outra pessoa. Limite não é frieza. É a condição pra ter algo de valor pra dar a quem realmente importa: sua esposa, seus filhos, seu chamado.', exercise: 'Identifique 1 limite que você perdeu: de tempo, energia, foco ou padrão. Escreva o que vai fazer pra recuperá-lo esta semana. Ore pedindo coragem pra sustentar isso.', reflection: 'Qual limite foi esse?' },
      { day: 3, title: 'Dizer Não é Um Músculo', theory: 'Você não lembra dos sins fáceis. Lembra do único não que custou algo. Dizer não não nasce pronto, se treina. Cada não real, dito com clareza, fortalece o músculo que você vai precisar nas decisões grandes. Guardar exige esse músculo treinado.', exercise: 'Diga 1 não real hoje, a alguém ou a alguma coisa. Sem se justificar demais. Sinta o desconforto e não recue. Ore: me dá firmeza pra guardar o que já decidi.', reflection: 'Como foi dizer não?' },
      { day: 4, title: 'Proteção Ativa do Tempo', theory: 'Toda agenda sem guarda tem um endereço. Chega na notificação de alguém. Tempo não guardado é roubado, por padrão: por aviso no celular, por pedido alheio, por hábito de distração. Guardar o tempo é ato deliberado, repetido todo dia, não sorte.', exercise: 'Pergunte-se hoje: como eu guardo meu tempo, na prática? Escolha 1 bloqueio real: silenciar notificação, marcar horário fechado. Aplique agora. Ore pedindo domínio sobre suas horas.', reflection: 'O que você protegeu?' },
      { day: 5, title: 'Discernimento é Filtro, Não Regra Rígida', theory: 'Você quer clareza. Nunca testou o que pode tirar da rotina. Discernimento não é lista fixa de proibição. É a capacidade de testar. Remover algo por um tempo, e observar o efeito real, revela o que tem valor e o que só ocupa espaço.', exercise: 'Escolha 1 coisa pra remover da rotina por 1 semana, como teste. Não é pra sempre, é experimento. Anote como se sentiu sem isso. Ore pedindo discernimento real, não regra vazia.', reflection: 'O que você removeu?' },
      { day: 6, title: 'Onde Você Cede Espaço', theory: 'Tolerância não substitui limite, só disfarça a guarda que caiu. Todo homem tem um ponto onde cede espaço que sabia que não devia ceder. Nomear esse ponto com honestidade é o primeiro passo pra fortalecê-lo. Sem nome, ele continua te drenando em silêncio.', exercise: 'Reflita com coragem: onde estou sendo fraco? Onde cedo espaço que não deveria? Escreva sem suavizar. Ore pedindo força pra fechar essa brecha.', reflection: 'Sua resposta sincera:' },
      { day: 7, title: 'Seus Guardiões Pessoais', theory: 'Você quer proteger sua família. Nunca escreveu o que vai proteger. Guardar se resume, no fim, a poucos princípios claros e inegociáveis. São seus guardiões pessoais: o que você decide proteger, custe o que custar. Sem eles nomeados, a guarda cede na primeira pressão.', exercise: 'Escreva seus guardiões pessoais: o que você vai proteger, sem negociar, daqui pra frente. Podem ser 3, podem ser 5. Ore entregando esses guardiões a Deus, pedindo força pra sustentá-los.', reflection: 'Seus guardiões pessoais:' },
    ],
  },
  liderar: {
    name: 'LIDERAR',
    color: VIOLET,
    week: 'SEMANA 4',
    description: 'Influência, visão, exemplo, transmissão',
    days: [
      { day: 1, title: 'Liderança Começa na Proximidade', theory: 'Homem que ignora quem lidera cria vácuo, não neutralidade. Liderança não é cargo, é condição. Todo homem já lidera alguém: esposa, filho, colega, amigo. Josué disse: eu e minha casa serviremos ao Senhor. Isso é decisão de líder, tomada antes de qualquer crise pedir.', exercise: 'Identifique hoje quem está sob sua influência direta: esposa, filho, colega, amigo. Escreva o nome. Ore por essa pessoa agora, nomeando o que ela precisa de você.', reflection: 'Quem você identificou?' },
      { day: 2, title: 'Visão Antes de Comando', theory: 'Ninguém lembra da ordem que recebeu. Lembra da visão que abraçou. Pessoas seguem visão. Ordem só gera obediência temporária. Visão gera direção que a pessoa carrega mesmo quando você não está por perto. Liderar bíblico é isso: apontar caminho, não empurrar.', exercise: 'Pergunte-se: qual é minha visão pra essa pessoa? Não uma lista de tarefa, uma direção. Escreva em 1 frase. Ore pedindo clareza pra comunicar isso sem impor.', reflection: 'Qual é essa visão?' },
      { day: 3, title: 'Exemplo Fala Mais Alto Que Discurso', theory: 'Discurso bonito não substitui exemplo, só disfarça a distância entre os dois. Quem você lidera aprende menos com o que você diz e mais com o que você faz, sem perceber que está sendo observado. Antes de cobrar um comportamento, pergunte se você mesmo pratica.', exercise: 'Pergunte-se: que comportamento eu quero que ela veja em mim? Pratique isso hoje, de propósito. Ore pedindo coerência entre o que fala e o que vive.', reflection: 'O que você praticou?' },
      { day: 4, title: 'Conversa de Visão, Não de Tarefa', theory: 'Você quer conexão. Só fala de tarefa. A maioria das conversas de liderança fica presa em agenda e planejamento. Conversa de visão é diferente: fala de propósito, de pra onde vocês estão indo juntos. Não só do que precisa ser feito hoje.', exercise: 'Puxe hoje uma conversa sobre visão e propósito, não sobre tarefa. Escute mais do que fala. Ore antes: me ajuda a ouvir, não só liderar a conversa.', reflection: 'Como foi a conversa?' },
      { day: 5, title: 'Liderar ou Mandar', theory: 'Toda ordem sem exemplo tem um endereço. Chega na obediência que só dura na sua frente. Mandar exige posição. Liderar exige respeito conquistado. A diferença aparece exatamente quando você sai da sala: a pessoa age pela visão, ou só pela ordem que recebeu?', exercise: 'Reflita com honestidade: estou liderando ou só mandando? Escolha 1 mudança concreta pra essa semana. Ore pedindo humildade pra ver a resposta real.', reflection: 'Resposta honesta:' },
      { day: 6, title: 'Você é o Modelo Antes de Ser o Mentor', theory: 'Homem que só ensina cria discurso, não discípulo. Todo discurso de liderança desmorona se o hábito pessoal não sustenta. As pessoas replicam o que veem, não o que ouvem. Por isso, o primeiro trabalho de um líder é sobre si mesmo, antes de qualquer outro.', exercise: 'Pergunte-se: que hábito meu ela deveria copiar? Verifique se você pratica isso hoje, de verdade. Se não pratica, comece agora. Ore pedindo que sua vida privada fale antes da pública.', reflection: 'Você está praticando esse hábito?' },
      { day: 7, title: 'Legado é Transmissão', theory: 'Você quer deixar legado. Nunca escreveu como quer ser lembrado. Liderança se mede pelo que resta quando você não está mais no comando. O que você construiu se sustenta sozinho, ou depende da sua presença o tempo todo? Essa é a pergunta que fecha o playbook.', exercise: 'Escreva sua declaração de liderança: como você quer ser lembrado por quem você lidera. Seja específico, não genérico. Ore entregando esse legado a Deus, pedindo que ele sustente o que você não puder.', reflection: 'Sua declaração de liderança:' },
    ],
  },
}

const finalQuizQuestions = [
  { id: 1, question: 'Qual pilar foi mais difícil de sustentar nessas 4 semanas?', answers: [{ text: 'Domínio Próprio', pillar: 'dominio' as PillarKey }, { text: 'Cultivar', pillar: 'cultivar' as PillarKey }, { text: 'Guardar', pillar: 'guardar' as PillarKey }, { text: 'Liderar', pillar: 'liderar' as PillarKey }] },
  { id: 2, question: 'Onde você sente que ainda falta consistência?', answers: [{ text: 'Nos meus padrões pessoais', pillar: 'dominio' as PillarKey }, { text: 'No meu crescimento', pillar: 'cultivar' as PillarKey }, { text: 'Nos meus limites', pillar: 'guardar' as PillarKey }, { text: 'Na minha influência', pillar: 'liderar' as PillarKey }] },
  { id: 3, question: 'Se pudesse continuar evoluindo com acompanhamento real, seria em quê?', answers: [{ text: 'Sustentar disciplina sozinho', pillar: 'dominio' as PillarKey }, { text: 'Investir de verdade em crescimento', pillar: 'cultivar' as PillarKey }, { text: 'Aprender a proteger meu tempo', pillar: 'guardar' as PillarKey }, { text: 'Aprender a liderar minha casa', pillar: 'liderar' as PillarKey }] },
  { id: 4, question: 'O que você mais quer sustentar nos próximos 90 dias?', answers: [{ text: 'Um padrão pessoal inegociável', pillar: 'dominio' as PillarKey }, { text: 'Progresso real em uma área', pillar: 'cultivar' as PillarKey }, { text: 'Limites que protegem minha família', pillar: 'guardar' as PillarKey }, { text: 'Exemplo que inspira quem me cerca', pillar: 'liderar' as PillarKey }] },
]

const finalMessages: Record<PillarKey, string> = {
  dominio: 'Toda semana sem domínio próprio tem um endereço. Chega aqui. Depois de 4 semanas, esse ainda é seu ponto fraco. Não é fracasso, é onde a maioria dos homens trava sozinho. Sozinho, o padrão cansa. Em O Código, você sustenta esse pilar junto com outros homens, toda semana, sem abandonar no meio do caminho.',
  cultivar: 'Você chegou até aqui. Ainda não investiu de verdade. Cultivar pede mais do que você deu sozinho. Crescimento não acontece isolado, acontece com direção e comunidade. É isso que O Código oferece: acompanhamento contínuo pra você não parar de investir em si mesmo.',
  guardar: 'Boa vontade não substitui limite, só disfarça a guarda que ainda falta. Sua maior batalha agora é Guardar: dizer não, proteger seu tempo, filtrar o que entra. Isso se treina com apoio, não sozinho. Em O Código, você tem uma comunidade que ajuda a manter esse limite todos os dias.',
  liderar: 'Você sustentou os 3 primeiros pilares. Agora vem o mais exigente: Liderar. Influenciar quem está ao seu redor pelo exemplo, não pelo discurso. Poucos homens chegam até aqui sozinhos. Em O Código, você continua essa jornada com homens que entendem o peso de liderar de verdade.',
}

// ─── Progress persistence ─────────────────────────────────────────────────────
function loadProgress(): WeekProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(data: WeekProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconFlame({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
      <path d="M28 4C28 4 14 20 14 32C14 42 20 50 28 50C36 50 42 42 42 32C42 26 38 22 36 18C36 24 32 26 30 24C27 21 30 14 28 4Z" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function IconGrowth({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
      <line x1="10" y1="46" x2="10" y2="30" stroke={color} strokeWidth="4" />
      <line x1="24" y1="46" x2="24" y2="20" stroke={color} strokeWidth="4" />
      <line x1="38" y1="46" x2="38" y2="10" stroke={color} strokeWidth="4" />
      <path d="M6 18 L20 6 L34 14 L48 2" stroke={color} strokeWidth="2" fill="none" />
      <path d="M40 2 L48 2 L48 10" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  )
}

function IconShield({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
      <path d="M28 4 L48 12 V28 C48 40 40 48 28 52 C16 48 8 40 8 28 V12 Z" stroke={color} strokeWidth="2" />
      <rect x="22" y="26" width="12" height="10" stroke={color} strokeWidth="2" />
      <line x1="28" y1="20" x2="28" y2="26" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function IconCompass({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="22" stroke={color} strokeWidth="2" />
      <polygon points="28,14 33,28 28,42 23,28" fill={color} opacity="0.7" />
      <circle cx="28" cy="28" r="3" fill={color} />
    </svg>
  )
}

const pillarIcons: Record<PillarKey, ({ color }: { color: string }) => JSX.Element> = {
  dominio: IconFlame,
  cultivar: IconGrowth,
  guardar: IconShield,
  liderar: IconCompass,
}

const pillarNumerals: Record<PillarKey, string> = {
  dominio: '01',
  cultivar: '02',
  guardar: '03',
  liderar: '04',
}

// ─── Internal Components ──────────────────────────────────────────────────────
function PillarBanner({ pillarKey }: { pillarKey: PillarKey }) {
  const pillar = pillarData[pillarKey]
  const Icon = pillarIcons[pillarKey]
  return (
    <div style={{ position: 'relative', overflow: 'hidden', border: `1px solid ${pillar.color}`, background: `linear-gradient(135deg, ${pillar.color}26 0%, #0D0D0D 75%)`, padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
      <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 110, fontWeight: 800, color: pillar.color, opacity: 0.08, letterSpacing: -4, lineHeight: 1, pointerEvents: 'none' }}>{pillarNumerals[pillarKey]}</span>
      <div style={{ width: 60, height: 60, minWidth: 60, border: `2px solid ${pillar.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }}>
        <Icon color={pillar.color} />
      </div>
      <div style={{ position: 'relative' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: 12, color: TEXT_DIM, letterSpacing: 2 }}>{pillar.week}</p>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: pillar.color, letterSpacing: 1 }}>{pillar.name}</h1>
      </div>
    </div>
  )
}

interface PlaybookSidebarProps {
  stage: Stage
  selectedPillar: PillarKey | null
  isPillarUnlocked: (key: PillarKey) => boolean
  getCompletedCount: (key: PillarKey) => number
  onNavigate: (target: string) => void
}

function PlaybookSidebar({ stage, selectedPillar, isPillarUnlocked, getCompletedCount, onNavigate }: PlaybookSidebarProps) {
  return (
    <div className="ocm-sidebar">
      <h2 onClick={() => onNavigate('dashboard')} style={{ fontSize: 20, fontWeight: 800, letterSpacing: 2, margin: '0 0 2px 0', cursor: 'pointer' }}>O CÓDIGO</h2>
      <p style={{ fontSize: 11, color: TEXT_DIM, margin: '0 0 20px 0' }}>Playbook 4 Semanas</p>
      <nav className="ocm-sidebar-nav">
        {pillarOrder.map((key) => {
          const pillar = pillarData[key]
          const unlocked = isPillarUnlocked(key)
          const completed = getCompletedCount(key)
          const isDone = completed === 7
          const isActive = stage === 'week' && selectedPillar === key
          const Icon = pillarIcons[key]
          return (
            <button key={key} onClick={() => unlocked && onNavigate(key)} className="ocm-sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', textAlign: 'left', background: isActive ? `${pillar.color}1A` : 'transparent', border: `1px solid ${isActive ? pillar.color : 'rgba(255,255,255,0.12)'}`, color: unlocked ? TEXT_LIGHT : TEXT_DIM, cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.45, fontFamily: "'Barlow Condensed', sans-serif" }}>
              <Icon color={unlocked ? pillar.color : TEXT_DIM} />
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: 1 }}>{pillar.week}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: unlocked ? pillar.color : TEXT_DIM, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{pillar.name}</span>
                <span style={{ fontSize: 11, color: TEXT_DIM, whiteSpace: 'nowrap' }}>{!unlocked ? '🔒 Bloqueado' : isDone ? '✓ Completo' : `${completed}/7 dias`}</span>
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

const layoutStyles = `
  .ocm-layout { display: flex; gap: 40px; align-items: flex-start; max-width: 1100px; margin: 0 auto; }
  .ocm-sidebar { width: 210px; flex-shrink: 0; position: sticky; top: 70px; }
  .ocm-sidebar-nav { display: flex; flex-direction: column; gap: 10px; }
  .ocm-content { flex: 1; min-width: 0; }
  .ocm-sidebar-item { width: 100%; }
  @media (max-width: 768px) {
    .ocm-layout { flex-direction: column; gap: 20px; }
    .ocm-sidebar { width: 100%; position: static; }
    .ocm-sidebar-nav { flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 6px; }
    .ocm-sidebar-nav button { min-width: 170px; }
  }
`

interface PlaybookLayoutProps extends PlaybookSidebarProps {
  children: React.ReactNode
}

function PlaybookLayout({ stage, selectedPillar, isPillarUnlocked, getCompletedCount, onNavigate, children }: PlaybookLayoutProps) {
  return (
    <>
      <style>{layoutStyles}</style>
      <div className="ocm-layout">
        <PlaybookSidebar stage={stage} selectedPillar={selectedPillar} isPillarUnlocked={isPillarUnlocked} getCompletedCount={getCompletedCount} onNavigate={onNavigate} />
        <div className="ocm-content">{children}</div>
      </div>
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PlaybookPage() {
  const [stage, setStage] = useState<Stage>('dashboard')
  const [userName, setUserName] = useState<string | null>(null)
  const [selectedPillar, setSelectedPillar] = useState<PillarKey | null>(null)
  const [weekProgress, setWeekProgress] = useState<WeekProgress>({})
  const [finalQuizAnswers, setFinalQuizAnswers] = useState<Record<number, PillarKey>>({})
  const [finalResultPillar, setFinalResultPillar] = useState<PillarKey | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setWeekProgress(loadProgress())
    setLoaded(true)
    getCurrentUserProfile().then(({ data }) => {
      if (data) setUserName(data.name)
    })
  }, [])

  useEffect(() => {
    if (loaded) saveProgress(weekProgress)
  }, [weekProgress, loaded])

  const getCompletedCount = (pillarKey: PillarKey) => {
    const progress = weekProgress[pillarKey] || {}
    return Object.values(progress).filter((d) => d.completed).length
  }

  const isPillarUnlocked = (pillarKey: PillarKey) => {
    const idx = pillarOrder.indexOf(pillarKey)
    if (idx === 0) return true
    const prevKey = pillarOrder[idx - 1]
    return getCompletedCount(prevKey) === 7
  }

  const allPillarsComplete = () => pillarOrder.every((k) => getCompletedCount(k) === 7)

  const startWeek = (pillarKey: PillarKey) => {
    if (!isPillarUnlocked(pillarKey)) return
    setSelectedPillar(pillarKey)
    setStage('week')
    if (!weekProgress[pillarKey]) {
      const progress: PillarProgress = {}
      pillarData[pillarKey].days.forEach((_, idx) => {
        progress[idx + 1] = { completed: false, reflection: '' }
      })
      setWeekProgress((prev) => ({ ...prev, [pillarKey]: progress }))
    }
  }

  const toggleDayComplete = (day: number) => {
    if (!selectedPillar) return
    const pillarProgress = weekProgress[selectedPillar] || {}
    const dayProgress = pillarProgress[day] || { completed: false, reflection: '' }
    setWeekProgress((prev) => ({
      ...prev,
      [selectedPillar]: { ...pillarProgress, [day]: { ...dayProgress, completed: !dayProgress.completed } },
    }))
  }

  const updateReflection = (day: number, text: string) => {
    if (!selectedPillar) return
    const pillarProgress = weekProgress[selectedPillar] || {}
    setWeekProgress((prev) => ({
      ...prev,
      [selectedPillar]: { ...pillarProgress, [day]: { ...pillarProgress[day], reflection: text } },
    }))
  }

  const getStreak = () => {
    if (!selectedPillar || !weekProgress[selectedPillar]) return 0
    const progress = weekProgress[selectedPillar]!
    let streak = 0
    for (let i = 1; i <= 7; i++) {
      if (progress[i]?.completed) streak++
      else break
    }
    return streak
  }

  const handleFinalQuizAnswer = (questionId: number, pillar: PillarKey) => {
    const newAnswers = { ...finalQuizAnswers, [questionId]: pillar }
    setFinalQuizAnswers(newAnswers)
    if (Object.keys(newAnswers).length === 4) {
      const counts: Record<PillarKey, number> = { dominio: 0, cultivar: 0, guardar: 0, liderar: 0 }
      Object.values(newAnswers).forEach((p) => { counts[p]++ })
      const recommended = (Object.keys(counts) as PillarKey[]).reduce((a, b) => counts[a] > counts[b] ? a : b)
      setFinalResultPillar(recommended)
      setStage('finalResult')
    }
  }

  const buildWhatsAppLink = (pillarKey: PillarKey) => {
    const pillarName = pillarData[pillarKey].name
    const message = `Olá Jonathas! Completei as 4 semanas do playbook. Meu diagnóstico apontou ${pillarName} como meu maior ponto de atenção agora. Quero entender como entrar em O Código.`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  const completedDays = selectedPillar && weekProgress[selectedPillar]
    ? Object.values(weekProgress[selectedPillar]!).filter((d) => d.completed).length
    : 0

  const handleNavigate = (target: string) => {
    if (target === 'dashboard') setStage('dashboard')
    else startWeek(target as PillarKey)
  }

  if (!loaded) return null

  const watermark = userName && (
    <p style={{ fontSize: 11, color: TEXT_DIM, margin: '0 0 24px 0', opacity: 0.7 }}>
      Acesso pessoal de {userName}. Este conteúdo é intransferível.
    </p>
  )

  const wrapper = { fontFamily: "'Barlow Condensed', sans-serif", color: TEXT_LIGHT, padding: '20px 20px 40px' }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  if (stage === 'dashboard') {
    return (
      <div style={wrapper}>
        <PlaybookLayout stage={stage} selectedPillar={selectedPillar} isPillarUnlocked={isPillarUnlocked} getCompletedCount={getCompletedCount} onNavigate={handleNavigate}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, letterSpacing: 2 }}>O CÓDIGO</h1>
          <p style={{ fontSize: 14, color: TEXT_DIM, marginBottom: 16 }}>Playbook de 4 Semanas. A ordem é fixa: cada pilar sustenta o próximo.</p>
          {watermark}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {pillarOrder.map((key) => {
              const pillar = pillarData[key]
              const unlocked = isPillarUnlocked(key)
              const completed = getCompletedCount(key)
              const isDone = completed === 7
              const Icon = pillarIcons[key]
              return (
                <div key={key} onClick={() => unlocked && startWeek(key)} style={{ padding: 24, border: `2px solid ${unlocked ? pillar.color : TEXT_DIM}`, background: isDone ? 'rgba(201, 160, 80, 0.1)' : 'transparent', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.4, transition: 'all 0.3s', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Icon color={unlocked ? pillar.color : TEXT_DIM} /></div>
                  <p style={{ fontSize: 11, color: TEXT_DIM, margin: '0 0 8px 0', letterSpacing: 1 }}>{pillar.week}</p>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: unlocked ? pillar.color : TEXT_DIM, margin: '0 0 10px 0', letterSpacing: 1 }}>{pillar.name}</h3>
                  <p style={{ fontSize: 12, color: TEXT_DIM, margin: 0 }}>{!unlocked ? 'Bloqueado' : isDone ? 'Completo ✓' : `${completed}/7 dias`}</p>
                </div>
              )
            })}
          </div>
          {allPillarsComplete() && (
            <div style={{ marginTop: 40, padding: 24, background: 'rgba(201, 160, 80, 0.15)', border: `2px solid ${GOLD}`, textAlign: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: GOLD, margin: '0 0 10px 0', letterSpacing: 1 }}>AS 4 SEMANAS ESTÃO COMPLETAS</h2>
              <p style={{ fontSize: 14, color: TEXT_LIGHT, margin: '0 0 20px 0', lineHeight: 1.6 }}>Chegou a hora do diagnóstico final. Ele indica onde você mais precisa de acompanhamento agora.</p>
              <button onClick={() => setStage('finalQuiz')} style={{ padding: '14px 28px', background: GOLD, border: 'none', color: '#0D0D0D', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>INICIAR DIAGNÓSTICO FINAL</button>
            </div>
          )}
        </PlaybookLayout>
      </div>
    )
  }

  // ── Week View ────────────────────────────────────────────────────────────────
  if (stage === 'week' && selectedPillar && pillarData[selectedPillar]) {
    const pillar = pillarData[selectedPillar]
    const progress = weekProgress[selectedPillar] || {}
    const streak = getStreak()
    return (
      <div style={wrapper}>
        <PlaybookLayout stage={stage} selectedPillar={selectedPillar} isPillarUnlocked={isPillarUnlocked} getCompletedCount={getCompletedCount} onNavigate={handleNavigate}>
          <button onClick={() => setStage('dashboard')} style={{ background: 'transparent', border: `1px solid ${TEXT_DIM}`, color: TEXT_DIM, padding: '8px 16px', cursor: 'pointer', fontSize: 12, marginBottom: 20, fontFamily: "'Barlow Condensed', sans-serif" }}>← Voltar</button>
          <PillarBanner pillarKey={selectedPillar} />
          <p style={{ fontSize: 14, color: TEXT_DIM, margin: '0 0 12px 0' }}>{pillar.description}</p>
          {watermark}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
            <div style={{ padding: 20, background: 'rgba(201, 160, 80, 0.1)', border: `2px solid ${GOLD}`, textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: 12, color: TEXT_DIM }}>DIAS COMPLETOS</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: GOLD }}>{completedDays}/7</p>
            </div>
            <div style={{ padding: 20, background: 'rgba(123, 111, 212, 0.1)', border: `2px solid ${VIOLET}`, textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: 12, color: TEXT_DIM }}>SEQUÊNCIA</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: VIOLET }}>🔥 {streak}</p>
            </div>
            <div style={{ padding: 20, background: 'rgba(255,255,255,0.05)', border: `2px solid ${TEXT_DIM}`, textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: 12, color: TEXT_DIM }}>PROGRESSO</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: TEXT_LIGHT }}>{Math.round((completedDays / 7) * 100)}%</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {pillar.days.map((dayData, idx) => {
              const dayNum = idx + 1
              const dayProgress = progress[dayNum] || { completed: false, reflection: '' }
              return (
                <div key={dayNum} style={{ padding: 24, border: `2px solid ${dayProgress.completed ? GOLD : TEXT_DIM}`, background: dayProgress.completed ? 'rgba(201, 160, 80, 0.08)' : 'transparent', transition: 'all 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 16 }}>
                    <button onClick={() => toggleDayComplete(dayNum)} aria-label={`Marcar dia ${dayNum} como concluído`} style={{ width: 40, height: 40, minWidth: 40, border: `2px solid ${dayProgress.completed ? GOLD : TEXT_DIM}`, background: dayProgress.completed ? GOLD : 'transparent', color: dayProgress.completed ? '#0D0D0D' : TEXT_LIGHT, fontSize: 20, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {dayProgress.completed ? '✓' : ''}
                    </button>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: dayProgress.completed ? GOLD : TEXT_LIGHT, letterSpacing: 1 }}>DIA {dayNum}: {dayData.title}</h3>
                    </div>
                  </div>
                  <div style={{ marginLeft: 60 }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: pillar.color, display: 'block', marginBottom: 6, fontWeight: 700, letterSpacing: 1 }}>TEORIA</label>
                      <p style={{ fontSize: 14, color: TEXT_DIM, margin: 0, lineHeight: 1.6 }}>{dayData.theory}</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: TEXT_LIGHT, display: 'block', marginBottom: 6, fontWeight: 700, letterSpacing: 1 }}>PRÁTICA</label>
                      <p style={{ fontSize: 14, color: TEXT_LIGHT, margin: 0, lineHeight: 1.6 }}>{dayData.exercise}</p>
                    </div>
                    <label style={{ fontSize: 12, color: TEXT_DIM, display: 'block', marginBottom: 8, fontWeight: 600 }}>REFLEXÃO: {dayData.reflection}</label>
                    <textarea value={dayProgress.reflection} onChange={(e) => updateReflection(dayNum, e.target.value)} placeholder="Sua resposta aqui..." style={{ width: '100%', minHeight: 80, padding: 12, background: 'rgba(255,255,255,0.05)', border: `1px solid ${TEXT_DIM}`, color: TEXT_LIGHT, fontSize: 14, fontFamily: "'Barlow Condensed', sans-serif", resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                </div>
              )
            })}
          </div>
          {completedDays === 7 && (
            <div style={{ marginTop: 40, padding: 24, background: 'rgba(201, 160, 80, 0.15)', border: `2px solid ${GOLD}`, textAlign: 'center' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: GOLD, margin: '0 0 10px 0', letterSpacing: 1 }}>SEMANA COMPLETA 🔥</h2>
              <p style={{ fontSize: 14, color: TEXT_LIGHT, margin: '0 0 20px 0', lineHeight: 1.6 }}>Você completou {pillar.name}.</p>
              <button onClick={() => setStage('dashboard')} style={{ padding: '12px 24px', background: GOLD, border: 'none', color: '#0D0D0D', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>VOLTAR AO PAINEL</button>
            </div>
          )}
        </PlaybookLayout>
      </div>
    )
  }

  // ── Final Quiz ───────────────────────────────────────────────────────────────
  if (stage === 'finalQuiz') {
    const currentQuestion = finalQuizQuestions[Object.keys(finalQuizAnswers).length]
    return (
      <div style={wrapper}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, textAlign: 'center', letterSpacing: 2 }}>DIAGNÓSTICO FINAL</h1>
          <p style={{ fontSize: 13, color: TEXT_DIM, textAlign: 'center', marginBottom: 12 }}>Depois de 4 semanas, é hora de ver o que ainda precisa de sustentação.</p>
          <div style={{ textAlign: 'center' }}>{watermark}</div>
          <div style={{ background: 'rgba(201, 160, 80, 0.1)', border: `2px solid ${GOLD}`, padding: 20, marginBottom: 30 }}>
            <p style={{ margin: '0 0 20px 0', fontSize: 14, color: TEXT_DIM }}>Pergunta {Object.keys(finalQuizAnswers).length + 1} de 4</p>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 20px 0', lineHeight: 1.4 }}>{currentQuestion.question}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentQuestion.answers.map((answer, idx) => (
                <button key={idx} onClick={() => handleFinalQuizAnswer(currentQuestion.id, answer.pillar)} style={{ padding: '15px 20px', background: 'transparent', border: `2px solid ${TEXT_DIM}`, color: TEXT_LIGHT, cursor: 'pointer', fontSize: 16, fontWeight: 600, textAlign: 'left', fontFamily: "'Barlow Condensed', sans-serif" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = TEXT_DIM; e.currentTarget.style.color = TEXT_LIGHT }}>
                  {answer.text}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 4, background: 'rgba(201, 160, 80, 0.2)', marginTop: 40 }}>
            <div style={{ height: '100%', background: GOLD, width: `${(Object.keys(finalQuizAnswers).length / 4) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Final Result ─────────────────────────────────────────────────────────────
  if (stage === 'finalResult' && finalResultPillar) {
    const pillar = pillarData[finalResultPillar]
    return (
      <div style={wrapper}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: TEXT_DIM, letterSpacing: 2, marginBottom: 10 }}>SEU DIAGNÓSTICO</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: pillar.color, margin: '0 0 12px 0', letterSpacing: 1 }}>{pillar.name}</h1>
          {watermark}
          <div style={{ padding: 30, border: `2px solid ${pillar.color}`, background: 'rgba(201, 160, 80, 0.08)', marginBottom: 30, textAlign: 'left' }}>
            <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0, color: TEXT_LIGHT }}>{finalMessages[finalResultPillar]}</p>
          </div>
          <a href={buildWhatsAppLink(finalResultPillar)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '16px 32px', background: GOLD, border: 'none', color: '#0D0D0D', fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, width: '100%', textDecoration: 'none', boxSizing: 'border-box' }}>ENTRAR EM O CÓDIGO</a>
          <button onClick={() => setStage('dashboard')} style={{ background: 'transparent', border: `1px solid ${TEXT_DIM}`, color: TEXT_DIM, padding: '10px 20px', cursor: 'pointer', fontSize: 12, marginTop: 16, fontFamily: "'Barlow Condensed', sans-serif" }}>Voltar ao painel</button>
        </div>
      </div>
    )
  }

  return null
}
