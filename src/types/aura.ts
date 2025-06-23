// src/types/aura.ts

import { OSLabel } from './index';

export interface AuraRecommendation {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name as string
  color: string; // Tailwind color class or hex code
  action: {
    type: 'navigate' | 'open_modal' | 'trigger_event';
    target: string; // Route path, modal ID, or event name
    payload?: any;
  };
  priority: number; // 1-10, higher is more urgent/important
  essenceLabels: OSLabel[];
}

