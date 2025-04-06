import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { MLFingerprint } from './ml-fingerprint';
import { NextRequest } from 'next/server';
import { detectCountry, GeoResponse } from './geolocation';
import { VisitorData } from './types';

// Initialize MLFingerprint instance
const mlFingerprint = new MLFingerprint();

// Initialize the ML model when the module loads
if (typeof window !== 'undefined') {
  mlFingerprint.initialize().catch(error => {
    console.warn('Failed to initialize ML model:', error);
  });
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  
  const userAgent = window.navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && !/Chromium|Edge/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isEdge = /Edge/.test(userAgent);
  const isOpera = /Opera|OPR/.test(userAgent);

  if (isChrome) return 'Chrome';
  if (isFirefox) return 'Firefox';
  if (isSafari) return 'Safari';
  if (isEdge) return 'Edge';
  if (isOpera) return 'Opera';
  return 'Unknown';
}

export async function generateVisitorFingerprint(): Promise<VisitorData> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  
  const now = new Date().toISOString();
  const geoData = await detectCountry(result.visitorId);
  
  return {
    visitorId: result.visitorId,
    firstVisit: now,
    lastVisit: now,
    visitCount: 1,
    browser: detectBrowser(),
    country: geoData.country,
    countryCode: geoData.countryCode,
    preferences: {
      theme: 'light',
      language: navigator.language || 'en'
    },
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timestamp: Date.now()
  };
}

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
  
  // Get country using the centralized geolocation service
  const geoData = await detectCountry(visitorId);

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

  const now = new Date().toISOString();
  const visitorData: VisitorData = {
    visitorId,
    firstVisit: now,
    lastVisit: now,
    visitCount: 1,
    browser,
    country: geoData.country,
    countryCode: geoData.countryCode,
    preferences: {
      theme: 'light',
      language: acceptLanguage.split(',')[0]
    },
    screenResolution: 'unknown',
    timestamp: Date.now()
  };

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

export async function analyzeVisitorPatterns(visitor: VisitorData) {
  return mlFingerprint.detectPatterns(visitor);
} 