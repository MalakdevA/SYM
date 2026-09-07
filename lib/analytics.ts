'use client';

export interface PageViewRecord {
  path: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  bounceRate: string;
  avgDuration: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  activeNow: number;
  avgSessionDuration: string;
  bounceRate: string;
  conversionRate: string;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  trafficSources: {
    source: string;
    percentage: number;
    count: number;
  }[];
}

const ANALYTICS_STORAGE_KEY = 'sym_egypt_analytics_v2';

const INITIAL_PAGE_VIEWS: PageViewRecord[] = [];

export function getStoredAnalytics(): PageViewRecord[] {
  if (typeof window === 'undefined') return INITIAL_PAGE_VIEWS;
  try {
    const saved = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load analytics', e);
  }
  return INITIAL_PAGE_VIEWS;
}

export function recordPageView(path: string, title?: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredAnalytics();
    const existingIndex = current.findIndex((item) => item.path === path);

    let updated: PageViewRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        views: updated[existingIndex].views + 1,
        uniqueVisitors: updated[existingIndex].uniqueVisitors + (Math.random() > 0.4 ? 1 : 0),
        title: title || updated[existingIndex].title,
      };
    } else {
      const newRecord: PageViewRecord = {
        path,
        title: title || path,
        views: 1,
        uniqueVisitors: 1,
        bounceRate: '20%',
        avgDuration: '2m 00s',
        trend: 'up',
        changePercent: '+100%',
      };
      updated = [newRecord, ...current];
    }

    // Sort by views descending
    updated.sort((a, b) => b.views - a.views);
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const pages = getStoredAnalytics();
  const totalViews = pages.reduce((sum, p) => sum + p.views, 0);
  const uniqueVisitors = pages.reduce((sum, p) => sum + p.uniqueVisitors, 0);

  return {
    totalViews,
    uniqueVisitors,
    activeNow: totalViews > 0 ? 1 : 0,
    avgSessionDuration: totalViews > 0 ? '2m 30s' : '0m 00s',
    bounceRate: totalViews > 0 ? '20.0%' : '0.0%',
    conversionRate: totalViews > 0 ? '2.5%' : '0.0%',
    deviceBreakdown: {
      mobile: totalViews > 0 ? 70 : 0,
      desktop: totalViews > 0 ? 25 : 0,
      tablet: totalViews > 0 ? 5 : 0,
    },
    trafficSources: totalViews > 0 ? [
      { source: 'بحث جوجل (Google SEO)', percentage: 50, count: Math.round(totalViews * 0.50) },
      { source: 'زيارات مباشرة (Direct Navigation)', percentage: 50, count: Math.round(totalViews * 0.50) },
    ] : [],
  };
}
