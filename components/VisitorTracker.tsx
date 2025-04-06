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
        console.log('Starting visitor tracking...');
        
        // Generate visitor fingerprint
        const fingerprint = await generateVisitorFingerprint();
        console.log('Generated fingerprint:', fingerprint);
        
        // Extract just the visitorId from the fingerprint data
        const visitorIdString = typeof fingerprint === 'string' ? fingerprint : fingerprint.visitorId;
        console.log('Extracted visitorId:', visitorIdString);
        
        // Try to find existing visitor data in localStorage
        const storedData = localStorage.getItem('visitorData');
        console.log('Stored visitor data:', storedData);
        const storedVisitor = storedData ? JSON.parse(storedData) : null;
        
        // Check if this is a returning visitor who cleared their history
        let isReturningVisitor = false;
        if (!storedVisitor) {
          try {
            console.log('Checking for returning visitor...');
            // If no stored data, check server for matching fingerprint
            const checkResponse = await fetch(`/api/visitor/check-fingerprint?fingerprint=${visitorIdString}`);
            if (!checkResponse.ok) {
              const errorData = await checkResponse.json();
              throw new Error(`Fingerprint check failed: ${errorData.error || 'Unknown error'}`);
            }
            const checkResult = await checkResponse.json();
            isReturningVisitor = checkResult.exists;
            console.log('Returning visitor check result:', checkResult);
          } catch (checkError) {
            console.error('Error checking returning visitor:', checkError);
            // Continue execution even if fingerprint check fails
          }
        }

        setVisitorId(visitorIdString);

        // Get screen resolution and browser info
        const screenResolution = `${window.screen?.width || 1920}x${window.screen?.height || 1080}`;
        const userAgent = window.navigator.userAgent;
        const browser = 
          /Chrome/.test(userAgent) && !/Chromium|Edge/.test(userAgent) ? 'Chrome' :
          /Firefox/.test(userAgent) ? 'Firefox' :
          /Safari/.test(userAgent) && !/Chrome/.test(userAgent) ? 'Safari' :
          /Edge/.test(userAgent) ? 'Edge' :
          /Opera|OPR/.test(userAgent) ? 'Opera' : 'Unknown';

        console.log('Browser info:', { browser, userAgent, screenResolution });

        // Always increment visit count if:
        // 1. No stored data (new visitor or cleared history)
        // 2. 30 minutes have passed since last visit
        const lastVisitTime = localStorage.getItem('lastVisitTime');
        const currentTime = Date.now();
        const shouldIncrementVisit = !storedData || 
          (currentTime - parseInt(lastVisitTime || '0')) >= 30 * 60 * 1000;

        // Save current visit time
        localStorage.setItem('lastVisitTime', currentTime.toString());

        const requestBody = {
          visitorId: visitorIdString,
          browser,
          screenResolution,
          preferences: {
            theme: localStorage.getItem('theme') || 'light',
            language: navigator.language || 'en'
          },
          shouldIncrementVisit,
          isReturningVisitor
        };

        console.log('Sending visitor data to API:', requestBody);

        // Send visitor data to API
        const response = await fetch('/api/visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API request failed: ${errorData.error || 'Unknown error'} (${response.status})`);
        }

        const data = await response.json();
        console.log('API response:', data);

        // Store visitor data in localStorage for profile access
        const visitorData = {
          visitorId: visitorIdString,
          ...data
        };
        localStorage.setItem('visitorData', JSON.stringify(visitorData));
        console.log('Stored visitor data:', visitorData);

        setError(null);
      } catch (error) {
        console.error('Error in visitor tracking:', error);
        // Provide more detailed error message
        const errorMessage = error instanceof Error 
          ? `Tracking failed: ${error.message}`
          : 'Failed to track visitor: Unknown error';
        setError(errorMessage);
        
        // Try to recover stored data if available
        try {
          const storedData = localStorage.getItem('visitorData');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setVisitorId(parsedData.visitorId);
            console.log('Recovered visitor ID from stored data:', parsedData.visitorId);
          }
        } catch (recoveryError) {
          console.error('Failed to recover stored visitor data:', recoveryError);
        }
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