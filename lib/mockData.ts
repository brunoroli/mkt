import { BM, DailyMetric, Campaign, AdAccount } from './types'

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function generateDailyMetrics(
  seed: number,
  baseDailySpend: number,
  baseRoas: number,
  days = 30
): DailyMetric[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (days - 1 - i))
    const s = seed + i * 17
    const variance = 0.5 + sr(s) * 1.0
    const isWeekend = [0, 6].includes(date.getDay())
    const dayFactor = isWeekend ? 0.65 : 1.2
    const spend = Math.round(baseDailySpend * variance * dayFactor * 100) / 100
    const roas = Math.round(baseRoas * (0.7 + sr(s * 2.3) * 0.6) * 100) / 100
    const revenue = Math.round(spend * roas * 100) / 100
    const cpm = 18 + sr(s * 3.7) * 22
    const impressions = Math.floor((spend / cpm) * 1000)
    const ctr = 0.012 + sr(s * 4.1) * 0.018
    const clicks = Math.floor(impressions * ctr)
    const convRate = 0.015 + sr(s * 5.9) * 0.025
    const conversions = Math.max(0, Math.floor(clicks * convRate))
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')

    return { date: `${y}-${m}-${d}`, spend, revenue, roas, impressions, clicks, conversions }
  })
}

function makeCampaigns(
  metrics: DailyMetric[],
  defs: { id: string; name: string; status: Campaign['status']; objective: string; frac: number; roasMult: number }[]
): Campaign[] {
  const totSpend = metrics.reduce((a, d) => a + d.spend, 0)
  const totRevenue = metrics.reduce((a, d) => a + d.revenue, 0)
  const totImpr = metrics.reduce((a, d) => a + d.impressions, 0)
  const totClicks = metrics.reduce((a, d) => a + d.clicks, 0)
  const totConv = metrics.reduce((a, d) => a + d.conversions, 0)

  return defs.map((def) => {
    const spend = Math.round(totSpend * def.frac * 100) / 100
    const revenue = Math.round(totRevenue * def.frac * def.roasMult * 100) / 100
    const roas = Math.round((revenue / spend) * 100) / 100
    const impressions = Math.floor(totImpr * def.frac)
    const clicks = Math.floor(totClicks * def.frac)
    const conversions = Math.floor(totConv * def.frac)
    const ctr = clicks > 0 && impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0
    const cpc = clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0
    const cpm = impressions > 0 ? Math.round((spend / impressions) * 1000 * 100) / 100 : 0
    return { id: def.id, name: def.name, status: def.status, objective: def.objective, spend, revenue, roas, impressions, clicks, ctr, cpc, cpm, conversions }
  })
}

// === NA ONDA ===
const naOndaD1 = generateDailyMetrics(101, 250, 2.8)
const naOndaD2 = generateDailyMetrics(102, 110, 2.2)

const naOndaAcc1: AdAccount = {
  id: 'act_naonda_001',
  name: 'Na Onda – E-commerce',
  dailyMetrics: naOndaD1,
  campaigns: makeCampaigns(naOndaD1, [
    { id: 'c_n1', name: 'Conversões – Produto Principal', status: 'ACTIVE', objective: 'CONVERSIONS', frac: 0.55, roasMult: 1.15 },
    { id: 'c_n2', name: 'Remarketing – Carrinho Abandonado', status: 'ACTIVE', objective: 'CONVERSIONS', frac: 0.28, roasMult: 1.3 },
    { id: 'c_n3', name: 'Awareness – Topo de Funil', status: 'PAUSED', objective: 'REACH', frac: 0.17, roasMult: 0.4 },
  ]),
}

const naOndaAcc2: AdAccount = {
  id: 'act_naonda_002',
  name: 'Na Onda – Tráfego Orgânico',
  dailyMetrics: naOndaD2,
  campaigns: makeCampaigns(naOndaD2, [
    { id: 'c_n4', name: 'Tráfego – Blog e Redes Sociais', status: 'ACTIVE', objective: 'TRAFFIC', frac: 0.6, roasMult: 0.9 },
    { id: 'c_n5', name: 'Leads – Newsletter', status: 'ACTIVE', objective: 'LEADS', frac: 0.4, roasMult: 1.1 },
  ]),
}

// === BRN MKT ===
const brnD1 = generateDailyMetrics(201, 620, 3.4)
const brnD2 = generateDailyMetrics(202, 450, 3.0)
const brnD3 = generateDailyMetrics(203, 290, 2.7)

const brnAcc1: AdAccount = {
  id: 'act_brn_001',
  name: 'BRN MKT – Cliente Varejo',
  dailyMetrics: brnD1,
  campaigns: makeCampaigns(brnD1, [
    { id: 'c_b1', name: 'Promoção Especial – Ofertas', status: 'PAUSED', objective: 'CONVERSIONS', frac: 0.45, roasMult: 1.2 },
    { id: 'c_b2', name: 'Conversões – Catálogo de Produtos', status: 'ACTIVE', objective: 'CATALOG_SALES', frac: 0.35, roasMult: 1.0 },
    { id: 'c_b3', name: 'Remarketing DPA', status: 'ACTIVE', objective: 'CATALOG_SALES', frac: 0.2, roasMult: 1.5 },
  ]),
}

const brnAcc2: AdAccount = {
  id: 'act_brn_002',
  name: 'BRN MKT – Cliente Serviços',
  dailyMetrics: brnD2,
  campaigns: makeCampaigns(brnD2, [
    { id: 'c_b4', name: 'Geração de Leads Qualificados', status: 'ACTIVE', objective: 'LEADS', frac: 0.5, roasMult: 1.1 },
    { id: 'c_b5', name: 'Tráfego – Landing Page', status: 'ACTIVE', objective: 'TRAFFIC', frac: 0.3, roasMult: 0.8 },
    { id: 'c_b6', name: 'Awareness – Vídeo Institucional', status: 'ACTIVE', objective: 'VIDEO_VIEWS', frac: 0.2, roasMult: 0.3 },
  ]),
}

const brnAcc3: AdAccount = {
  id: 'act_brn_003',
  name: 'BRN MKT – Agência',
  dailyMetrics: brnD3,
  campaigns: makeCampaigns(brnD3, [
    { id: 'c_b7', name: 'Prospecção B2B', status: 'ACTIVE', objective: 'LEADS', frac: 0.65, roasMult: 1.05 },
    { id: 'c_b8', name: 'Remarketing – Visitantes do Site', status: 'ACTIVE', objective: 'CONVERSIONS', frac: 0.35, roasMult: 1.4 },
  ]),
}

// === PRIME HERO ACADEMY ===
const phD1 = generateDailyMetrics(301, 680, 5.1)
const phD2 = generateDailyMetrics(302, 360, 4.7)
const phD3 = generateDailyMetrics(303, 210, 4.0)

const phAcc1: AdAccount = {
  id: 'act_prime_001',
  name: 'Prime Hero – Curso Principal',
  dailyMetrics: phD1,
  campaigns: makeCampaigns(phD1, [
    { id: 'c_p1', name: 'Conversões – Matrícula Curso', status: 'ACTIVE', objective: 'CONVERSIONS', frac: 0.5, roasMult: 1.2 },
    { id: 'c_p2', name: 'Leads – Webinar Gratuito', status: 'ACTIVE', objective: 'LEADS', frac: 0.3, roasMult: 0.9 },
    { id: 'c_p3', name: 'Remarketing – Página de Vendas', status: 'ACTIVE', objective: 'CONVERSIONS', frac: 0.2, roasMult: 1.6 },
  ]),
}

const phAcc2: AdAccount = {
  id: 'act_prime_002',
  name: 'Prime Hero – Mentorias VIP',
  dailyMetrics: phD2,
  campaigns: makeCampaigns(phD2, [
    { id: 'c_p4', name: 'Aplicação – Mentoria High Ticket', status: 'ACTIVE', objective: 'LEADS', frac: 0.6, roasMult: 1.3 },
    { id: 'c_p5', name: 'Remarketing – Alunos Ativos', status: 'ACTIVE', objective: 'CONVERSIONS', frac: 0.4, roasMult: 1.1 },
  ]),
}

const phAcc3: AdAccount = {
  id: 'act_prime_003',
  name: 'Prime Hero – Comunidade',
  dailyMetrics: phD3,
  campaigns: makeCampaigns(phD3, [
    { id: 'c_p6', name: 'Membros – Comunidade Premium', status: 'ACTIVE', objective: 'CONVERSIONS', frac: 0.55, roasMult: 1.0 },
    { id: 'c_p7', name: 'Engajamento – Conteúdo Educacional', status: 'PAUSED', objective: 'ENGAGEMENT', frac: 0.45, roasMult: 0.2 },
  ]),
}

// === FALATÓRIA CLAUDE ===
const falatoriaD1 = generateDailyMetrics(401, 180, 2.5)

const falatoriaAcc1: AdAccount = {
  id: 'act_1793423111547017',
  name: 'Falatória Claude',
  dailyMetrics: falatoriaD1,
  campaigns: makeCampaigns(falatoriaD1, [
    { id: 'c_f1', name: 'Conversões – Vendas', status: 'ACTIVE', objective: 'OUTCOME_SALES', frac: 0.6, roasMult: 1.1 },
    { id: 'c_f2', name: 'Tráfego – Novos Visitantes', status: 'ACTIVE', objective: 'OUTCOME_TRAFFIC', frac: 0.4, roasMult: 0.7 },
  ]),
}

export const bms: BM[] = [
  {
    id: 'na-onda',
    slug: 'na-onda',
    name: 'Na onda',
    color: '#F97316',
    letter: 'N',
    adAccounts: [naOndaAcc1, naOndaAcc2],
  },
  {
    id: 'brn-mkt',
    slug: 'brn-mkt',
    name: 'BRN MKT',
    color: '#3B82F6',
    letter: 'B',
    adAccounts: [brnAcc1, brnAcc2, brnAcc3],
  },
  {
    id: 'prime-hero-academy',
    slug: 'prime-hero-academy',
    name: 'Prime Hero Academy Platform',
    color: '#EAB308',
    letter: 'P',
    adAccounts: [phAcc1, phAcc2, phAcc3],
  },
  {
    id: 'falatoria-claude',
    slug: 'falatoria-claude',
    name: 'Falatória',
    color: '#8B5CF6',
    letter: 'F',
    adAccounts: [falatoriaAcc1],
  },
]
