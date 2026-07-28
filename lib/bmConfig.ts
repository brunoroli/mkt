export const BM_CONFIG = [
  {
    id: 'na-onda',
    slug: 'na-onda',
    name: 'Na onda',
    color: '#F97316',
    letter: 'N',
    businessId: '1997017994210974',
    accounts: [
      { id: 'act_1246670554176437', name: 'Naonda BM' },
    ],
  },
  {
    id: 'brn-mkt',
    slug: 'brn-mkt',
    name: 'BRN MKT',
    color: '#3B82F6',
    letter: 'B',
    businessId: '25617278144526293',
    accounts: [
      { id: 'act_807918871961043', name: 'Cobertura Biarritz' },
    ],
  },
  {
    id: 'prime-hero-academy',
    slug: 'prime-hero-academy',
    name: 'Prime Hero Academy Platform',
    color: '#EAB308',
    letter: 'P',
    businessId: '1555687322458942',
    accounts: [
      { id: 'act_1304765918250359', name: 'PHAP - QA' },
      { id: 'act_814992444613895', name: 'PHAP' },
    ],
  },
  {
    id: 'falatoria-claude',
    slug: 'falatoria-claude',
    name: 'Falatória',
    color: '#8B5CF6',
    letter: 'F',
    businessId: '961772566625696',
    accounts: [
      { id: 'act_1793423111547017', name: 'Falatória Claude' },
    ],
  },
  {
    id: 'b3g',
    slug: 'b3g',
    name: 'B3G Incorporadora',
    color: '#10B981',
    letter: 'B',
    businessId: '828085376362013',
    accounts: [
      { id: 'act_993570016560751', name: 'B3G' },
      { id: 'act_2168495447218568', name: 'Residencial Canadá' },
      { id: 'act_1009450441868665', name: 'Cobertura Biarritz' },
    ],
  },
]

export type BMConfigEntry = typeof BM_CONFIG[number]
