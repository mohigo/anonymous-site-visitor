'use client';

import { useEffect } from 'react';
import { MLFingerprint } from '@/lib/ml-fingerprint';

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

export default function VisitorTracker() {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Check if we've already tracked this visit in the current session
        const lastTracked = sessionStorage.getItem('lastTracked');
        const now = Date.now();
        if (lastTracked && (now - parseInt(lastTracked)) < 30 * 60 * 1000) { // 30 minutes session
          return; // Skip if tracked recently
        }
        
        // Initialize ML fingerprinting
        const mlFingerprint = new MLFingerprint();
        await mlFingerprint.initialize();

        // Get stored visitor data
        const storedData = localStorage.getItem('visitorData');
        let visitorData = storedData ? JSON.parse(storedData) : null;

        // Generate new fingerprint and visitor ID if needed
        if (!visitorData || !visitorData.fingerprint || !visitorData.visitorId) {
          const fingerprint = await mlFingerprint.generateFingerprint();
          visitorData = {
            visitorId: crypto.randomUUID(),
            fingerprint,
            firstVisit: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            visitCount: 1,
            browser: detectBrowser(),
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            preferences: {
              theme: 'light',
              language: navigator.language || 'en'
            }
          };
        } else {
          // Update existing visitor data
          visitorData = {
            ...visitorData,
            lastVisit: new Date().toISOString(),
            browser: detectBrowser(),
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          };
        }

        // Detect patterns and anomalies
        const patterns = await mlFingerprint.detectPatterns(visitorData);
        visitorData.patterns = patterns;

        // Store updated data
        localStorage.setItem('visitorData', JSON.stringify(visitorData));

        // Send to server
        const response = await fetch('/api/visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(visitorData),
        });

        if (!response.ok) {
          throw new Error('Failed to update visitor data');
        }

        // Update last tracked time
        sessionStorage.setItem('lastTracked', now.toString());
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();
  }, []);

  // Return null since this is just a tracking component
  return null;
}

async function detectCountry(timezone: string): Promise<string> {
  // Simple timezone to country mapping
  const timezoneMap: { [key: string]: string } = {
    'America/New_York': 'United States',
    'America/Los_Angeles': 'United States',
    'Europe/London': 'United Kingdom',
    'Europe/Paris': 'France',
    'Europe/Berlin': 'Germany',
    'Asia/Tokyo': 'Japan',
    'Asia/Shanghai': 'China',
    'Australia/Sydney': 'Australia',
  };

  return timezoneMap[timezone] || 'Unknown';
} 