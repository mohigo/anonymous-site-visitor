import { useState, useEffect } from 'react';
import { generateVisitorFingerprint, storeVisitorData, getStoredVisitorData } from '@/lib/fingerprint';

export function useVisitorTracking() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en'
  });

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Get stored visitor data
        const storedData = getStoredVisitorData();
        
        if (storedData) {
          setVisitorId(storedData.visitorId);
          return;
        }

        // Generate new visitor data
        const visitorData = await generateVisitorFingerprint();
        storeVisitorData(visitorData);
        setVisitorId(visitorData.visitorId);

        // Send data to server
        await fetch('/api/visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitorId: visitorData.visitorId,
            preferences
          }),
        });
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();
  }, [preferences]);

  const updatePreferences = async (newPreferences: typeof preferences) => {
    if (!visitorId) return;

    try {
      await fetch('/api/visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorId,
          preferences: newPreferences
        }),
      });
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return {
    visitorId,
    preferences,
    updatePreferences
  };
} 