// Equipamento inicial curado a mao (as regras do Aurora nao trazem isso
// estruturado, so em prosa). Por enquanto cobre Ladino + Criminoso.

export interface EquipChoice {
  label: string
  options: string[]
}

export interface ClassEquipment {
  goldText: string // ex: "4d4 × 10 po"
  goldAverage: number // valor medio se pegar ouro em vez de itens
  choices: EquipChoice[] // escolhas "a/b/c"
  fixed: string[] // itens que vem sempre
}

export interface BackgroundEquipment {
  fixed: string[]
  gp: number // moedas de ouro do antecedente
}

// Chaveado pelo nome em ingles da classe.
export const CLASS_EQUIPMENT: Record<string, ClassEquipment> = {
  Rogue: {
    goldText: '4d4 × 10 po',
    goldAverage: 100,
    choices: [
      { label: 'Arma principal', options: ['Florete', 'Espada curta'] },
      {
        label: 'Arma à distância',
        options: ['Arco curto e aljava com 20 flechas', 'Espada curta'],
      },
      {
        label: 'Mochila',
        options: [
          'Mochila de assaltante',
          'Mochila de masmorra',
          'Mochila de explorador',
        ],
      },
    ],
    fixed: ['Armadura de couro', 'Duas adagas', 'Ferramentas de ladrão'],
  },
}

// Chaveado pelo nome em ingles do antecedente.
export const BACKGROUND_EQUIPMENT: Record<string, BackgroundEquipment> = {
  Criminal: {
    fixed: ['Pé de cabra', 'Roupas comuns escuras com capuz'],
    gp: 15,
  },
}
