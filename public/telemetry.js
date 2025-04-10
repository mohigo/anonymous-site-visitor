(function() {
  const VizLens = {
    init: function(config) {
      if (!config || !config.siteId) {
        console.error('VizLens initialization failed: siteId is required');
        return;
      }
      
      this.siteId = config.siteId;
      this.options = config.options || {};
      
      // For local testing use the test endpoint
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        this.baseUrl = '/api/test-telemetry';
      } else {
        this.baseUrl = 'https://vizlens.net';
      }
      
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
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    },
    
    _sendData: function(eventType, data) {
      const endpoint = `${this.baseUrl}/${eventType}`;
      
      // Add privacy controls based on options
      if (this.options.privacy === true) {
        // Anonymize IP and limit data collection
        data.anonymizeIp = true;
      }
      
      const payload = JSON.stringify(data);
      
      // Use sendBeacon for better reliability when available
      if (navigator.sendBeacon && !this.options.disableBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
      } else {
        // Fall back to fetch API
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: payload,
          // Use keepalive to ensure the request completes even if the page unloads
          keepalive: true
        }).catch(error => {
          console.error('VizLens: Error sending data:', error);
        });
      }
    },
    
    _setupClickTracking: function() {
      document.addEventListener('click', (event) => {
        const target = event.target.closest('a, button, [role="button"]');
        if (!target) return;
        
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
      // Try to get existing visitor ID from localStorage
      let visitorId = localStorage.getItem('vizlens_visitor_id');
      
      if (!visitorId) {
        // Generate a new ID if none exists
        visitorId = 'vis_' + Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
        localStorage.setItem('vizlens_visitor_id', visitorId);
      }
      
      return visitorId;
    }
  };
  
  // Legacy support for existing implementations using FusionLeap name
  window.FusionLeap = VizLens;
  
  // Expose the VizLens object to the global scope
  window.VizLens = VizLens;
})(); 