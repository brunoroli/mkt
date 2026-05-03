export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED'

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  objective: string
  spend: number
  revenue: number
  roas: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  conversions: number
}

export interface DailyMetric {
  date: string
  spend: number
  revenue: number
  roas: number
  impressions: number
  clicks: number
  conversions: number
}

export interface AdAccount {
  id: string
  name: string
  campaigns: Campaign[]
  dailyMetrics: DailyMetric[]
}

export interface BM {
  id: string
  slug: string
  name: string
  color: string
  letter: string
  adAccounts: AdAccount[]
}
