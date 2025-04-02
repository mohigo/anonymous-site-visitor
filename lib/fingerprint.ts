import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { MLFingerprint } from './ml-fingerprint';
import { NextRequest } from 'next/server';

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
}

export async function generateVisitorFingerprint(): Promise<VisitorData> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  
  const now = new Date().toISOString();
  
  return {
    visitorId: result.visitorId,
    firstVisit: now,
    lastVisit: now,
    visitCount: 1,
    browser: detectBrowser(),
    country: await detectCountry(),
    preferences: {
      theme: 'light',
      language: navigator.language || 'en'
    },
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timestamp: Date.now()
  };
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
}

async function detectCountry(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      return data.country_name || 'Unknown';
    }
  } catch (error) {
    console.warn('Could not detect country:', error);
  }
  return 'Unknown';
}

interface GeoResponse {
  ip: string;
  country_name: string;
  country_code: string;
  region: string;
  city: string;
  error?: boolean;
  reason?: string;
}

const mlFingerprint = new MLFingerprint();

export async function generateServerFingerprint(req: NextRequest): Promise<VisitorData> {
  const userAgent = req.headers.get('user-agent') || '';
  const acceptLanguage = req.headers.get('accept-language') || 'en';
  
  // Get client IP address from various headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() 
          : realIp ? realIp 
          : req.headers.get('x-client-ip') || '127.0.0.1';
  
  // Generate a simple hash based on user agent
  const visitorId = userAgent
    .split('')
    .reduce((acc: number, char: string) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0)
    .toString(16);
  
  // Get country from IP using a geolocation API
  let country = 'Unknown';
  try {
    // Skip geolocation for localhost
    if (ip !== '127.0.0.1') {
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      if (geoResponse.ok) {
        const geoData: GeoResponse = await geoResponse.json();
        if (!geoData.error) {
          country = geoData.country_name || 'Unknown';
        }
      }
    }
  } catch (error) {
    console.error('Error fetching country:', error);
  }

  // Detect browser from user agent
  let browser = 'Unknown';
  if (userAgent.includes('Firefox/')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg/')) {
    browser = 'Edge';
  }

  const visitorData = {
    visitorId,
    timestamp: Date.now(),
    userAgent,
    screenResolution: 'unknown', // We can't get this server-side
    colorDepth: 24, // Default value
    timezone: 'UTC', // Default value
    language: acceptLanguage.split(',')[0],
    browser,
    country,
  };

  // Generate ML-based fingerprint
  visitorData.visitorId = await mlFingerprint.generateFingerprint(visitorData);

  return visitorData;
}

export function storeVisitorData(data: VisitorData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('visitorData', JSON.stringify(data));
  }
}

export function getStoredVisitorData(): VisitorData | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('visitorData');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
}

export async function analyzeVisitorPatterns(visitors: VisitorData[]) {
  return mlFingerprint.detectPatterns(visitors);
} 