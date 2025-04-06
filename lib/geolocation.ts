import { NextRequest } from 'next/server';

export interface GeoResponse {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
}

// Cache geolocation results in memory
let geoCache: { [key: string]: { data: GeoResponse; timestamp: number } } = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function tryIpAPI(ip: string): Promise<GeoResponse | null> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Anonymous Site Visitor/1.0'
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (!data.error) {
        console.log('ipapi.co success:', data);
        return {
          country: data.country_name,
          countryCode: data.country_code,
          region: data.region,
          city: data.city
        };
      } else {
        console.warn('ipapi.co returned error:', data.error);
      }
    } else {
      console.warn('ipapi.co response not ok:', response.status);
    }
  } catch (error) {
    console.warn('ipapi.co lookup failed:', error);
  }
  return null;
}

async function tryIPWhois(ip: string): Promise<GeoResponse | null> {
  try {
    const response = await fetch(`https://ipwho.is/${ip}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Anonymous Site Visitor/1.0'
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success !== false) {
        console.log('ipwho.is success:', data);
        return {
          country: data.country,
          countryCode: data.country_code,
          region: data.region,
          city: data.city
        };
      } else {
        console.warn('ipwho.is returned error:', data);
      }
    } else {
      console.warn('ipwho.is response not ok:', response.status);
    }
  } catch (error) {
    console.warn('ipwho.is lookup failed:', error);
  }
  return null;
}

async function tryGeoJS(ip: string): Promise<GeoResponse | null> {
  try {
    const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Anonymous Site Visitor/1.0'
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('geojs.io success:', data);
      return {
        country: data.country,
        countryCode: data.country_code,
        region: data.region,
        city: data.city
      };
    } else {
      console.warn('geojs.io response not ok:', response.status);
    }
  } catch (error) {
    console.warn('geojs.io lookup failed:', error);
  }
  return null;
}

function getTimezoneBasedCountry(): GeoResponse | null {
  try {
    if (typeof Intl === 'undefined') return null;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('Detected timezone:', timezone);
    
    // Comprehensive timezone to country mapping with more US timezones
    const timezoneMap: { [key: string]: [string, string] } = {
      // United States timezones
      'America/New_York': ['United States', 'US'],
      'America/Chicago': ['United States', 'US'],
      'America/Denver': ['United States', 'US'],
      'America/Los_Angeles': ['United States', 'US'],
      'America/Phoenix': ['United States', 'US'],
      'America/Anchorage': ['United States', 'US'],
      'America/Adak': ['United States', 'US'],
      'America/Honolulu': ['United States', 'US'],
      'America/Detroit': ['United States', 'US'],
      'America/Boise': ['United States', 'US'],
      'America/Indiana/Indianapolis': ['United States', 'US'],
      'America/Indiana/Knox': ['United States', 'US'],
      'America/Indiana/Marengo': ['United States', 'US'],
      'America/Indiana/Petersburg': ['United States', 'US'],
      'America/Indiana/Tell_City': ['United States', 'US'],
      'America/Indiana/Vevay': ['United States', 'US'],
      'America/Indiana/Vincennes': ['United States', 'US'],
      'America/Indiana/Winamac': ['United States', 'US'],
      'America/Kentucky/Louisville': ['United States', 'US'],
      'America/Kentucky/Monticello': ['United States', 'US'],
      'America/North_Dakota/Beulah': ['United States', 'US'],
      'America/North_Dakota/Center': ['United States', 'US'],
      'America/North_Dakota/New_Salem': ['United States', 'US'],
      'Pacific/Honolulu': ['United States', 'US'],
      
      // Canada timezones
      'America/Toronto': ['Canada', 'CA'],
      'America/Vancouver': ['Canada', 'CA'],
      'America/Montreal': ['Canada', 'CA'],
      'America/Halifax': ['Canada', 'CA'],
      'America/Winnipeg': ['Canada', 'CA'],
      'America/Regina': ['Canada', 'CA'],
      'America/St_Johns': ['Canada', 'CA'],
      
      // European timezones
      'Europe/London': ['United Kingdom', 'GB'],
      'Europe/Paris': ['France', 'FR'],
      'Europe/Berlin': ['Germany', 'DE'],
      'Europe/Rome': ['Italy', 'IT'],
      'Europe/Madrid': ['Spain', 'ES'],
      'Europe/Amsterdam': ['Netherlands', 'NL'],
      'Europe/Zurich': ['Switzerland', 'CH'],
      'Europe/Brussels': ['Belgium', 'BE'],
      'Europe/Vienna': ['Austria', 'AT'],
      'Europe/Stockholm': ['Sweden', 'SE'],
      
      // Asian timezones
      'Asia/Tokyo': ['Japan', 'JP'],
      'Asia/Shanghai': ['China', 'CN'],
      'Asia/Singapore': ['Singapore', 'SG'],
      'Asia/Dubai': ['United Arab Emirates', 'AE'],
      'Asia/Seoul': ['South Korea', 'KR'],
      'Asia/Hong_Kong': ['Hong Kong', 'HK'],
      'Asia/Taipei': ['Taiwan', 'TW'],
      
      // Oceania timezones
      'Australia/Sydney': ['Australia', 'AU'],
      'Australia/Melbourne': ['Australia', 'AU'],
      'Australia/Brisbane': ['Australia', 'AU'],
      'Australia/Perth': ['Australia', 'AU'],
      'Pacific/Auckland': ['New Zealand', 'NZ']
    };

    const [country, countryCode] = timezoneMap[timezone] || [];
    if (country && countryCode) {
      console.log('Timezone-based country detection:', { country, countryCode, timezone });
      return {
        country,
        countryCode
      };
    } else {
      console.log('No country found for timezone:', timezone);
    }
  } catch (error) {
    console.warn('Timezone-based lookup failed:', error);
  }
  return null;
}

function getClientIP(req?: NextRequest): string | null {
  if (!req) return null;

  try {
    // Try to get IP from various headers
    const headers = req.headers;
    if (!headers) return null;

    // Try x-forwarded-for header first (most reliable)
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
      // Get the first IP if multiple are present
      const ips = forwardedFor.split(',').map(ip => ip.trim());
      return ips[0];
    }

    // Try other common headers in order of reliability
    const realIP = headers.get('x-real-ip');
    if (realIP) return realIP;

    const clientIP = headers.get('x-client-ip');
    if (clientIP) return clientIP;

    const cfConnectingIP = headers.get('cf-connecting-ip');
    if (cfConnectingIP) return cfConnectingIP;

    const fastlyClientIP = headers.get('fastly-client-ip');
    if (fastlyClientIP) return fastlyClientIP;

    const trueClientIP = headers.get('true-client-ip');
    if (trueClientIP) return trueClientIP;

    // Try to get IP from request URL as a last resort
    const url = new URL(req.url);
    const ipParam = url.searchParams.get('ip');
    if (ipParam) return ipParam;

    // Log that we couldn't find an IP
    console.warn('No IP address found in request headers or URL');
  } catch (error) {
    console.warn('Error getting client IP:', error);
  }

  return null;
}

export async function detectCountry(req?: NextRequest): Promise<GeoResponse> {
  console.log('Starting country detection...');
  
  const clientIP = getClientIP(req);
  console.log('Detected client IP:', clientIP);

  // Check cache if we have an IP
  if (clientIP && geoCache[clientIP]) {
    const cached = geoCache[clientIP];
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached geolocation data');
      return cached.data;
    } else {
      // Remove expired cache entry
      delete geoCache[clientIP];
    }
  }

  // Default response if all methods fail
  const defaultResponse: GeoResponse = {
    country: 'Unknown',
    countryCode: 'XX'
  };

  try {
    // Try timezone-based detection first as it's more reliable
    console.log('Trying timezone-based detection first...');
    const tzCountry = getTimezoneBasedCountry();
    if (tzCountry) {
      console.log('Timezone-based detection succeeded:', tzCountry);
      // Cache the result if we have an IP
      if (clientIP) {
        geoCache[clientIP] = {
          data: tzCountry,
          timestamp: Date.now()
        };
      }
      return tzCountry;
    }

    if (clientIP) {
      // Try each geolocation service in sequence with a timeout
      const timeout = 5000; // 5 seconds timeout
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      );

      // Try IP-based detection with timeout
      console.log('Trying IP-based detection...');
      
      const geoResponse = await Promise.race([
        tryGeoJS(clientIP).catch(error => {
          console.warn('geojs.io failed with error:', error);
          return null;
        }),
        timeoutPromise
      ]) || await Promise.race([
        tryIPWhois(clientIP).catch(error => {
          console.warn('ipwho.is failed with error:', error);
          return null;
        }),
        timeoutPromise
      ]) || await Promise.race([
        tryIpAPI(clientIP).catch(error => {
          console.warn('ipapi.co failed with error:', error);
          return null;
        }),
        timeoutPromise
      ]);

      if (geoResponse) {
        console.log('IP-based detection succeeded:', geoResponse);
        // Cache the result
        geoCache[clientIP] = {
          data: geoResponse,
          timestamp: Date.now()
        };
        return geoResponse;
      }
    }
  } catch (error) {
    console.warn('All geolocation methods failed:', error);
  }

  console.log('All detection methods failed, returning default response');
  return defaultResponse;
}

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(geoCache).forEach(key => {
    if (now - geoCache[key].timestamp >= CACHE_DURATION) {
      delete geoCache[key];
    }
  });
}, CACHE_DURATION); 