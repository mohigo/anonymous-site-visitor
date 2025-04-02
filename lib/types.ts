export interface VisitorData {
  visitorId: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  browser: string;
  country: string;
  preferences: {
    theme: string;
    language: string;
  };
  screenResolution: string;
  timestamp: number;
  patterns?: {
    behaviorPatterns: string[];
    anomalyScore: {
      isAnomaly: boolean;
      confidence: number;
    };
  };
} 