import { BM, AdAccount, Campaign, DailyMetric } from './types'
import { BMConfigEntry } from './bmConfig'

const BASE = 'https://graph.facebook.com/v21.0'

const TOKEN_BY_SLUG: Record<string, string | undefined> = {
  'na-onda':            process.env.META_TOKEN_NA_ONDA,
  'brn-mkt':            process.env.META_TOKEN_BRN_MKT,
  'prime-hero-academy': process.env.META_TOKEN_PRIME_HERO,
  'falatoria-claude':   process.env.META_TOKEN_FALATORIA,
  'b3g':                process.env.META_TOKEN_B3G,
}

function getToken(slug: string): string {
  return TOKEN_BY_SLUG[slug] ?? process.env.META_ACCESS_TOKEN ?? ''
}

async function apiFetch(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}/${path}`)
  url.searchParams.set('access_token', token)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  const data = await res.json()
  if (data.error) throw new Error(`Meta API [${path}]: ${data.error.message} (code ${data.error.code})`)
  return data
}

function pickAction(actions: any[] = [], ...types: string[]): number {
  for (const type of types) {
    const found = actions.find((a) => a.action_type === type)
    if (found) return parseFloat(found.value ?? '0')
  }
  return 0
}

function pickRevenue(actionValues: any[] = []): number {
  return pickAction(
    actionValues,
    'purchase',
    'offsite_conversion.fb_pixel_purchase',
    'omni_purchase',
  )
}

function pickConversions(actions: any[] = []): number {
  return pickAction(
    actions,
    'purchase',
    'offsite_conversion.fb_pixel_purchase',
    'omni_purchase',
    'lead',
    'complete_registration',
  )
}

function parseDailyMetric(d: any): DailyMetric {
  const spend = parseFloat(d.spend ?? '0')
  const impressions = parseInt(d.impressions ?? '0', 10)
  const clicks = parseInt(d.clicks ?? '0', 10)
  const conversions = pickConversions(d.actions)
  const revenue = pickRevenue(d.action_values)
  const roas = spend > 0 ? revenue / spend : 0
  return {
    date: d.date_start,
    spend: Math.round(spend * 100) / 100,
    revenue: Math.round(revenue * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    impressions,
    clicks,
    conversions,
  }
}

function parseCampaignInsight(camp: any, insight: any | null): Campaign {
  if (!insight) {
    return {
      id: camp.id, name: camp.name,
      status: camp.status, objective: camp.objective ?? '',
      spend: 0, revenue: 0, roas: 0,
      impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, conversions: 0,
    }
  }
  const spend = parseFloat(insight.spend ?? '0')
  const impressions = parseInt(insight.impressions ?? '0', 10)
  const clicks = parseInt(insight.clicks ?? '0', 10)
  const conversions = pickConversions(insight.actions)
  const revenue = pickRevenue(insight.action_values)
  const roas = spend > 0 ? revenue / spend : 0
  return {
    id: camp.id,
    name: camp.name,
    status: camp.status,
    objective: camp.objective ?? '',
    spend: Math.round(spend * 100) / 100,
    revenue: Math.round(revenue * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    impressions,
    clicks,
    ctr: Math.round(parseFloat(insight.ctr ?? '0') * 100) / 100,
    cpc: Math.round(parseFloat(insight.cpc ?? '0') * 100) / 100,
    cpm: Math.round(parseFloat(insight.cpm ?? '0') * 100) / 100,
    conversions,
  }
}

async function fetchAdAccount(acc: { id: string; name: string }, token: string): Promise<AdAccount> {
  const today = new Date()
  const since = new Date(today)
  since.setDate(since.getDate() - 29)
  const sinceStr = since.toISOString().split('T')[0]
  const untilStr = today.toISOString().split('T')[0]

  const insightFields = 'date_start,spend,impressions,clicks,actions,action_values,cpm,cpc,ctr'

  const [dailyData, campaignsData] = await Promise.all([
    apiFetch(`${acc.id}/insights`, token, {
      fields: insightFields,
      time_range: JSON.stringify({ since: sinceStr, until: untilStr }),
      time_increment: '1',
      level: 'account',
    }),
    apiFetch(`${acc.id}/campaigns`, token, {
      fields: 'id,name,status,objective',
      limit: '50',
    }),
  ])

  const dailyMetrics: DailyMetric[] = (dailyData.data ?? []).map(parseDailyMetric)

  const campaigns: Campaign[] = await Promise.all(
    (campaignsData.data ?? []).map(async (camp: any) => {
      const res = await apiFetch(`${camp.id}/insights`, token, {
        fields: 'spend,impressions,clicks,actions,action_values,cpm,cpc,ctr',
        date_preset: 'last_30d',
      })
      return parseCampaignInsight(camp, res.data?.[0] ?? null)
    })
  )

  return {
    id: acc.id,
    name: acc.name,
    campaigns,
    dailyMetrics,
  }
}

export async function fetchBM(config: BMConfigEntry): Promise<BM> {
  const token = getToken(config.slug)
  const adAccounts = await Promise.all(config.accounts.map((acc) => fetchAdAccount(acc, token)))

  return {
    id: config.id,
    slug: config.slug,
    name: config.name,
    color: config.color,
    letter: config.letter,
    adAccounts,
  }
}
