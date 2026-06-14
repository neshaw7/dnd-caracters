// Traducoes PT-BR feitas a mao das features das classes que o Luiz usa.
// O que nao estiver aqui cai no texto original (ingles) automaticamente.

export interface FeaturePt {
  name: string
  text: string
}

// Nome PT de subclasses (arquetipos).
export const SUBCLASS_PT: Record<string, string> = {
  Thief: 'Ladrão',
  Assassin: 'Assassino',
  'Arcane Trickster': 'Trapaceiro Arcano',
}

// Traducao por id de feature. Cobre Ladino, Trapaceiro Arcano e Artifice.
export const FEATURE_PT: Record<string, FeaturePt> = {
  // ---------------- Ladino ----------------
  ID_WOTC_PHB_CLASS_FEATURE_ROGUE_EXPERTISE: {
    name: 'Especialização',
    text: 'No 1º nível, escolha duas de suas proficiências em perícias, ou uma perícia e sua proficiência com ferramentas de ladrão. Seu bônus de proficiência é dobrado em qualquer teste de habilidade que use uma dessas proficiências. No 6º nível, escolha mais duas (perícias ou ferramentas de ladrão) para receber o mesmo benefício.',
  },
  ID_WOTC_PHB_CLASS_FEATURE_ROGUE_SNEAKATTACK: {
    name: 'Ataque Furtivo',
    text: 'A partir do 1º nível, você sabe golpear de forma sutil e explorar a distração de um inimigo. Uma vez por turno, você causa dano extra (veja a coluna Ataque Furtivo da tabela do Ladino) a uma criatura que acertar com um ataque, se tiver vantagem na jogada. O ataque deve usar uma arma de acuidade ou à distância. Você não precisa de vantagem se outro inimigo do alvo estiver a até 1,5 m dele, esse inimigo não estiver incapacitado e você não tiver desvantagem no ataque.',
  },
  ID_WOTC_PHB_CLASS_FEATURE_ROGUE_THIEVES_CANT: {
    name: 'Jargão dos Ladrões',
    text: 'Você aprendeu o jargão dos ladrões: uma mistura secreta de dialeto, gíria e código que permite esconder mensagens em conversas normais. Só quem conhece o jargão entende. Você também conhece sinais e símbolos secretos que comunicam coisas como se uma área é perigosa, território de uma guilda, se há saque por perto ou se o local é seguro.',
  },
  ID_WOTC_PHB_CLASS_FEATURE_ROGUE_CUNNINGACTION: {
    name: 'Ação Ardilosa',
    text: 'A partir do 2º nível, sua agilidade e raciocínio rápido permitem usar uma ação bônus em cada turno para Disparar (Dash), Recuar (Disengage) ou se Esconder (Hide).',
  },
  ID_WOTC_PHB_CLASS_FEATURE_ROGUE_ROGUISHARCHETYPE: {
    name: 'Arquétipo de Ladino',
    text: 'No 3º nível, você escolhe um arquétipo que reflete seu estilo (ex: Trapaceiro Arcano). Ele concede recursos no 3º nível e novamente no 9º, 13º e 17º.',
  },
  ID_WOTC_PHB_CLASS_FEATURE_ROGUE_UNCANNY_DODGE: {
    name: 'Esquiva Sobrenatural',
    text: 'A partir do 5º nível, quando um atacante que você consegue ver te acerta com um ataque, você pode usar sua reação para reduzir à metade o dano daquele ataque.',
  },
  ID_WOTC_PHB_CLASS_FEATURE_ROGUE_EVASION: {
    name: 'Evasão',
    text: 'A partir do 7º nível, você desvia de efeitos em área com agilidade. Quando for alvo de um efeito que permite teste de resistência de Destreza para metade do dano, você não sofre dano se passar e sofre metade se falhar.',
  },
  ID_WOTC_PHB_CLASS_FEATURE_ROGUE_ABILITYSCOREIMPROVEMENT_ROGUE: {
    name: 'Aumento de Atributo',
    text: 'Você pode aumentar um atributo em +2, ou dois atributos em +1 cada (máximo 20), ou pegar um talento (feat), se o seu jogo usar talentos.',
  },

  // ---------------- Trapaceiro Arcano ----------------
  ID_WOTC_PHB_ARCHETYPE_FEATURE_ARCANE_TRICKSTER_SPELLCASTING: {
    name: 'Conjuração',
    text: 'No 3º nível, você ganha a habilidade de conjurar magias da lista do Mago. Truques: aprende três truques (mão mágica/mage hand e mais dois à escolha; outro no 10º nível). Espaços de magia: a tabela do Trapaceiro Arcano mostra quantos espaços você tem; gaste um espaço do círculo da magia ou superior e recupere todos após um descanso longo. As magias aprendidas devem ser de encantamento ou ilusão (com poucas exceções livres). Inteligência é seu atributo de conjuração (CD e ataque das magias usam Inteligência).',
  },
  ID_WOTC_PHB_ARCHETYPE_FEATURE_ARCANE_TRICKSTER_MAGE_HAND_LEGERDEMAIN: {
    name: 'Mão Mágica Ardilosa',
    text: 'A partir do 3º nível, ao conjurar mão mágica (mage hand) você pode tornar a mão invisível e usá-la para: guardar ou retirar um objeto de algo que outra criatura esteja vestindo/carregando; ou usar ferramentas de ladrão à distância para abrir fechaduras e desarmar armadilhas. Pode fazer isso sem ser notado vencendo um teste de Prestidigitação (Destreza) contra a Percepção (Sabedoria) do alvo. Você também pode controlar a mão com a ação bônus da Ação Ardilosa.',
  },
  ID_WOTC_PHB_ARCHETYPE_FEATURE_ARCANE_TRICKSTER_MAGICAL_AMBUSH: {
    name: 'Emboscada Mágica',
    text: 'A partir do 9º nível, se você estiver escondido de uma criatura ao conjurar uma magia nela, ela tem desvantagem nos testes de resistência contra essa magia neste turno.',
  },
  ID_WOTC_PHB_ARCHETYPE_FEATURE_ARCANE_TRICKSTER_VERSATILE_TRICKSTER: {
    name: 'Trapaceiro Versátil',
    text: 'A partir do 13º nível, como ação bônus você pode usar a mão mágica para distrair uma criatura a até 1,5 m da mão, ganhando vantagem nas jogadas de ataque contra ela neste turno.',
  },
  ID_WOTC_PHB_ARCHETYPE_FEATURE_ARCANE_TRICKSTER_SPELL_THIEF: {
    name: 'Ladrão de Magias',
    text: 'No 17º nível, você pode roubar o conhecimento de uma magia. Quando uma criatura conjura uma magia tendo você como alvo, você usa a reação para forçar um teste de resistência; se falhar, você nega a magia e aprende a usá-la por um tempo. Uso recarrega após um descanso longo.',
  },

  // ---------------- Artífice ----------------
  ID_WOTC_TCOE_CLASS_FEATURE_ARTIFICER_MAGICAL_TINKERING: {
    name: 'Engenhoca Mágica',
    text: 'No 1º nível, você pode infundir pequenos truques mágicos em objetos minúsculos (luz, som, um cheiro, uma mensagem gravada, etc.), dentro do limite do seu modificador de Inteligência.',
  },
  ID_WOTC_TCOE_CLASS_FEATURE_ARTIFICER_SPELLCASTING: {
    name: 'Conjuração',
    text: 'No 1º nível, você conjura magias da lista do Artífice usando Inteligência. Você precisa de um foco de artífice (ferramentas) para conjurar. A tabela do Artífice mostra seus espaços de magia (recuperados em descanso longo); você prepara magias por dia conforme seu nível e Inteligência.',
  },
  ID_WOTC_TCOE_CLASS_FEATURE_ARTIFICER_INFUSE_ITEM: {
    name: 'Infundir Item',
    text: 'No 2º nível, você aprende infusões que transformam objetos comuns em itens mágicos. Você conhece um número de infusões e mantém algumas ativas ao mesmo tempo, conforme seu nível.',
  },
  ID_WOTC_TCOE_CLASS_FEATURE_ARTIFICER_ARTIFICER_SPECIALIST: {
    name: 'Especialista Artífice',
    text: 'No 3º nível, você escolhe sua especialização (ex: Alquimista, Armoreiro, Artilheiro, Ferreiro de Batalha), que define recursos adicionais nos níveis seguintes.',
  },
  ID_WOTC_TCOE_CLASS_FEATURE_ARTIFICER_THE_RIGHT_TOOL_FOR_THE_JOB: {
    name: 'A Ferramenta Certa',
    text: 'No 3º nível, com 1 hora de trabalho usando ferramentas de ladrão ou de artesão, você pode criar magicamente um conjunto de ferramentas de artesão de sua escolha.',
  },
  ID_WOTC_TCOE_CLASS_FEATURE_ARTIFICER_TOOL_EXPERTISE: {
    name: 'Especialização em Ferramentas',
    text: 'No 6º nível, seu bônus de proficiência é dobrado em testes que usem ferramentas com as quais você é proficiente.',
  },

  // ---------------- Antecedentes ----------------
  ID_BACKGROUND_FEATURE_CRIMINAL_CONTACT: {
    name: 'Contato Criminoso',
    text: 'Você tem um contato confiável que serve de ligação com uma rede de outros criminosos. Você sabe como enviar e receber mensagens desse contato, mesmo a grandes distâncias: conhece mensageiros locais, mestres de caravana corruptos e marinheiros suspeitos que podem entregar suas mensagens.',
  },
}
