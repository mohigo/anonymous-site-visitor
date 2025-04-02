'use client';

import { useEffect } from 'react';
import { MLFingerprint } from '@/lib/ml-fingerprint';

export default function VisitorTracker() {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Initialize ML fingerprinting
        const mlFingerprint = new MLFingerprint();
        await mlFingerprint.initialize();

        // Get stored visitor data
        const storedData = localStorage.getItem('visitorData');
        let visitorData = storedData ? JSON.parse(storedData) : null;

        // Generate new fingerprint if needed
        if (!visitorData || !visitorData.fingerprint) {
          const fingerprint = await mlFingerprint.generateFingerprint();
          visitorData = {
            ...visitorData,
            fingerprint,
            firstVisit: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            visitCount: 1
          };
        }

        // Update last visit time
        visitorData.lastVisit = new Date().toISOString();
        visitorData.visitCount = (visitorData.visitCount || 0) + 1;

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
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();
  }, []);

  // Return null since this is just a tracking component
  return null;
}

function detectBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
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