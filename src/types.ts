export type View = 'dashboard' | 'trends' | 'activity' | 'campaign' | 'settings';

export interface ScheduleSettings {
  date: string;
  time: string;
  type: 'one-time' | 'recurring';
  frequency?: 'daily' | 'weekly' | 'monthly';
}

export interface CampaignData {
  strategy: string;
  targetSegment: string;
  sendTime: string;
  estimatedAudience: string;
  subject: string;
  body: string;
  explanation: {
    audience: string;
    sendTime: string;
    tone: string;
  };
  schedule?: ScheduleSettings;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  status: 'info' | 'success' | 'loading';
}

export interface MetricCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
}

export interface ChartData {
  name: string;
  value: number;
}
