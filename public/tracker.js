(function() {
  const VizLens = {
    init: function(config) {
      if (!config || !config.siteId) {
        console.error('VizLens initialization failed: siteId is required');
        return;
      }
      
      this.siteId = config.siteId;
      this.options = config.options || {};
      
      // Always use the production endpoint for the CDN version
      this.baseUrl = 'https://vizlens.net/api';
      
      this.sessionId = this._generateSessionId();
      this.visitorId = this._getVisitorId();
      
      console.log('VizLens initialized for site:', this.siteId);
      
      // Track page view on initialization
      this.trackPageView();
      
      // Set up event listeners
      if (this.options.trackClicks !== false) {
        this._setupClickTracking();
      }
    },
    
    trackPageView: function() {
      const data = this._collectBaseData();
      data.pageTitle = document.title;
      data.pageUrl = window.location.href;
      data.referrer = document.referrer;
      
      this._sendData('pageview', data);
    },
    
    trackEvent: function(eventName, eventData) {
      if (!eventName) {
        console.error('VizLens: Event name is required for tracking');
        return;
      }
      
      const data = this._collectBaseData();
      data.eventName = eventName;
      data.eventData = eventData || {};
      
      // Add a custom event type flag to distinguish from automatic click tracking
      data.isCustomEvent = true;
      
      this._sendData('event', data);
    },
    
    _collectBaseData: function() {
      return {
        siteId: this.siteId,
        timestamp: new Date().toISOString(),
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // Include origin to help with CORS debugging
        origin: window.location.origin,
        // Flag this as a CDN request
        isCdnRequest: true
      };
    },
    
    _sendData: function(eventType, data) {
      const endpoint = `${this.baseUrl}/telemetry/${eventType}`;
      
      // Add privacy controls based on options
      if (this.options.privacy === true) {
        // Anonymize IP and limit data collection
        data.anonymizeIp = true;
      }
      
      const payload = JSON.stringify(data);
      
      // Use sendBeacon for better reliability when available
      if (navigator.sendBeacon && !this.options.disableBeacon) {
        try {
          const blob = new Blob([payload], { type: 'application/json' });
          const sent = navigator.sendBeacon(endpoint, blob);
          if (!sent) {
            this._fallbackFetch(endpoint, payload);
          }
        } catch (e) {
          console.error('VizLens: Error using sendBeacon, falling back to fetch:', e);
          this._fallbackFetch(endpoint, payload);
        }
      } else {
        // Fall back to fetch API
        this._fallbackFetch(endpoint, payload);
      }
    },
    
    _fallbackFetch: function(endpoint, payload) {
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: payload,
        // Use keepalive to ensure the request completes even if the page unloads
        keepalive: true,
        // Add CORS mode explicitly
        mode: 'cors',
        // Allow credentials to be sent with the request if not explicitly disabled
        credentials: this.options.disableCredentials ? 'omit' : 'include'
      }).catch(error => {
        console.error('VizLens: Error sending data:', error);
      });
    },
    
    _setupClickTracking: function() {
      // Create a flag to prevent double-tracking
      this.isTrackingCustomEvent = false;
      
      document.addEventListener('click', (event) => {
        // Skip if we're currently processing a custom event
        if (this.isTrackingCustomEvent) {
          this.isTrackingCustomEvent = false;
          return;
        }
        
        const target = event.target.closest('a, button, [role="button"]');
        if (!target) return;
        
        // Don't track test buttons from our test page
        if (target.id && target.id.startsWith('test-')) {
          return;
        }
        
        const data = {
          elementType: target.tagName.toLowerCase(),
          elementId: target.id || null,
          elementClass: target.className || null,
          elementText: target.innerText?.trim().substring(0, 50) || null,
          href: target.href || null
        };
        
        this.trackEvent('click', data);
      });
    },
    
    _generateSessionId: function() {
      return 'sess_' + Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    },
    
    _getVisitorId: function() {
      try {
        // Try to get existing visitor ID from localStorage
        let visitorId = localStorage.getItem('vizlens_visitor_id');
        
        if (!visitorId) {
          // Generate a new ID if none exists
          visitorId = 'vis_' + Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
          localStorage.setItem('vizlens_visitor_id', visitorId);
        }
        
        return visitorId;
      } catch (e) {
        // In case localStorage is not available (e.g., in some privacy modes)
        return 'vis_' + Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
      }
    }
  };
  
  // Legacy support for existing implementations using FusionLeap name
  window.FusionLeap = VizLens;
  
  // Expose the VizLens object to the global scope
  window.VizLens = VizLens;
  
  // Auto-initialize if there's a data-site-id attribute on the script tag
  document.addEventListener('DOMContentLoaded', function() {
    const scriptTags = document.querySelectorAll('script[src*="tracker.js"]');
    scriptTags.forEach(script => {
      const siteId = script.getAttribute('data-site-id');
      if (siteId) {
        VizLens.init({ siteId: siteId });
      }
    });
  });
})(); 