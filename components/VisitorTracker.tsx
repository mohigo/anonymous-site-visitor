'use client';

import { useEffect, useState } from 'react';
import { generateVisitorFingerprint } from '@/lib/fingerprint';
import { VisitorData } from '@/lib/types';

export default function VisitorTracker() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Generate visitor fingerprint
        const fingerprint = await generateVisitorFingerprint();
        
        // Extract just the visitorId from the fingerprint data
        const visitorIdString = typeof fingerprint === 'string' ? fingerprint : fingerprint.visitorId;
        setVisitorId(visitorIdString);

        // Get screen resolution
        const screenResolution = `${window.screen?.width || 1920}x${window.screen?.height || 1080}`;

        // Get browser info
        const userAgent = window.navigator.userAgent;
        const browser = 
          /Chrome/.test(userAgent) && !/Chromium|Edge/.test(userAgent) ? 'Chrome' :
          /Firefox/.test(userAgent) ? 'Firefox' :
          /Safari/.test(userAgent) && !/Chrome/.test(userAgent) ? 'Safari' :
          /Edge/.test(userAgent) ? 'Edge' :
          /Opera|OPR/.test(userAgent) ? 'Opera' : 'Unknown';

        // Check if we should increment visit count (30 minutes cooldown)
        const lastVisitTime = localStorage.getItem('lastVisitTime');
        const currentTime = Date.now();
        const shouldIncrementVisit = !lastVisitTime || (currentTime - parseInt(lastVisitTime)) >= 30 * 60 * 1000;

        // Save current visit time
        localStorage.setItem('lastVisitTime', currentTime.toString());

        // Send visitor data to API
        const response = await fetch('/api/visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitorId: visitorIdString,
            browser,
            screenResolution,
            preferences: {
              theme: localStorage.getItem('theme') || 'light',
              language: navigator.language || 'en'
            },
            shouldIncrementVisit
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to update visitor data');
        }

        // Store visitor data in localStorage for profile access
        localStorage.setItem('visitorData', JSON.stringify({
          visitorId: visitorIdString,
          ...data
        }));

        console.log('Visitor tracked:', data);
        setError(null);
      } catch (error) {
        console.error('Error tracking visitor:', error);
        setError(error instanceof Error ? error.message : 'Failed to track visitor');
      }
    };

    trackVisit();

    // Cleanup function
    return () => {
      // Any cleanup code if needed
    };
  }, []); // Empty dependency array means this runs once on mount

  if (error) {
    console.error('VisitorTracker error:', error);
  }

  return null; // This component doesn't render anything
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