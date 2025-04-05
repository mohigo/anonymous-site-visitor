import * as tf from '@tensorflow/tfjs';
import { VisitorData } from './fingerprint';

interface FeatureVector {
  userAgentHash: number[];
  screenFeatures: number[];
  timeFeatures: number[];
  browserFeatures: number[];
}

interface AnomalyScore {
  score: number;
  threshold: number;
  isAnomaly: boolean;
  reasons: string[];
}

export class MLFingerprint {
  private model: tf.LayersModel | null = null;
  private anomalyModel: tf.LayersModel | null = null;
  private readonly vectorSize = 40;
  private isInitialized = false;

  async initialize() {
    try {
      // Initialize TensorFlow.js
      await tf.ready();

      // Set backend based on environment
      if (typeof window !== 'undefined') {
        // Client-side: try WebGL first, fall back to CPU
        try {
          await tf.setBackend('webgl');
        } catch (e) {
          console.warn('WebGL backend not available, falling back to CPU');
          await tf.setBackend('cpu');
        }
      } else {
        // Server-side: use CPU backend
        await tf.setBackend('cpu');
      }

      // Clean up any existing models and tensors
      if (this.model) {
        this.model.dispose();
        this.model = null;
      }
      if (this.anomalyModel) {
        this.anomalyModel.dispose();
        this.anomalyModel = null;
      }

      // Reset TensorFlow's internal state
      tf.engine().reset();
      
      // Wait a bit to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create models with unique names
      const modelName = `fingerprint_model_${Date.now()}`;
      const anomalyModelName = `anomaly_model_${Date.now()}`;

      // Create a simple neural network for fingerprint generation
      this.model = tf.sequential({
        name: modelName,
        layers: [
          tf.layers.dense({ 
            name: `${modelName}_dense1`,
            inputShape: [40], 
            units: 32, 
            activation: 'relu',
            kernelInitializer: 'glorotNormal'
          }),
          tf.layers.dropout({ 
            name: `${modelName}_dropout`,
            rate: 0.2 
          }),
          tf.layers.dense({ 
            name: `${modelName}_dense2`,
            units: this.vectorSize, 
            activation: 'sigmoid',
            kernelInitializer: 'glorotNormal'
          })
        ]
      });

      await this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      // Create an autoencoder for anomaly detection
      this.anomalyModel = tf.sequential({
        name: anomalyModelName,
        layers: [
          // Encoder
          tf.layers.dense({ 
            name: `${anomalyModelName}_encoder1`,
            inputShape: [40], 
            units: 32, 
            activation: 'relu',
            kernelInitializer: 'glorotNormal'
          }),
          tf.layers.dense({ 
            name: `${anomalyModelName}_encoder2`,
            units: 16, 
            activation: 'relu',
            kernelInitializer: 'glorotNormal'
          }),
          // Decoder
          tf.layers.dense({ 
            name: `${anomalyModelName}_decoder1`,
            units: 32, 
            activation: 'relu',
            kernelInitializer: 'glorotNormal'
          }),
          tf.layers.dense({ 
            name: `${anomalyModelName}_decoder2`,
            units: 40, 
            activation: 'sigmoid',
            kernelInitializer: 'glorotNormal'
          })
        ]
      });

      await this.anomalyModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mse']
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing TensorFlow.js:', error);
      this.isInitialized = false;
      throw new Error('Failed to initialize ML system');
    }
  }

  private hashString(str: string | undefined): number[] {
    // Handle undefined or null input
    if (!str) {
      return new Array(16).fill(0.5);
    }

    // Convert string to fixed-length number array using simple hashing
    const hash = new Array(16).fill(0);
    for (let i = 0; i < str.length; i++) {
      hash[i % 16] = (hash[i % 16] + str.charCodeAt(i)) % 256;
    }
    return hash.map(h => h / 255);
  }

  private extractFeatures(visitor: VisitorData): FeatureVector {
    // Ensure all required fields have default values
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown';
    const screenResolution = visitor.screenResolution || '1920x1080';
    const timestamp = visitor.timestamp || Date.now();
    const browser = visitor.browser || this.detectBrowser();

    return {
      userAgentHash: this.hashString(userAgent),
      screenFeatures: screenResolution.split('x').map(n => parseInt(n) / 3840), // Normalize by 4K resolution
      timeFeatures: [
        Math.sin(2 * Math.PI * new Date(timestamp).getHours() / 24),
        Math.cos(2 * Math.PI * new Date(timestamp).getHours() / 24),
        Math.sin(2 * Math.PI * new Date(timestamp).getMinutes() / 60),
        Math.cos(2 * Math.PI * new Date(timestamp).getMinutes() / 60),
        Math.sin(2 * Math.PI * new Date(timestamp).getSeconds() / 60),
        Math.cos(2 * Math.PI * new Date(timestamp).getSeconds() / 60)
      ],
      browserFeatures: [
        browser === 'Chrome' ? 1 : 0,
        browser === 'Firefox' ? 1 : 0,
        browser === 'Safari' ? 1 : 0,
        browser === 'Edge' ? 1 : 0,
        browser === 'Opera' ? 1 : 0,
        browser === 'Unknown' ? 1 : 0
      ]
    };
  }

  private concatenateFeatures(features: FeatureVector): number[] {
    // Calculate total length of each feature array
    const totalLength = 
      features.userAgentHash.length +    // 16 values
      features.screenFeatures.length +    // 2 values
      features.timeFeatures.length +      // 6 values
      features.browserFeatures.length;    // 6 values

    // Calculate required padding to reach 40 values
    const paddingLength = Math.max(0, this.vectorSize - totalLength);
    const padding = new Array(paddingLength).fill(0.5);

    const vector = [
      ...features.userAgentHash,      // 16 values
      ...features.screenFeatures,     // 2 values
      ...features.timeFeatures,       // 6 values
      ...features.browserFeatures,    // 6 values
      ...padding                      // 10 padding values to reach 40 total
    ];

    // Double-check vector length
    if (vector.length !== this.vectorSize) {
      console.error(`Invalid vector length: ${vector.length}, expected: ${this.vectorSize}`);
      // Ensure exactly 40 values
      while (vector.length < this.vectorSize) vector.push(0.5);
      while (vector.length > this.vectorSize) vector.pop();
    }

    return vector;
  }

  public async generateFingerprint(): Promise<string> {
    if (!this.model) {
      await this.initialize();
    }

    const getScreenResolution = () => {
      if (typeof window === 'undefined') return '1920x1080';
      return `${window.screen?.width || 1920}x${window.screen?.height || 1080}`;
    };

    const visitorData: VisitorData = {
      visitorId: crypto.randomUUID(),
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitCount: 1,
      browser: this.detectBrowser(),
      country: await this.detectCountry(),
      preferences: {
        theme: 'light',
        language: 'en'
      },
      screenResolution: getScreenResolution(),
      timestamp: Date.now()
    };

    const features = this.extractFeatures(visitorData);
    const inputVector = this.concatenateFeatures(features);
    const tensorInput = tf.tensor2d([inputVector]);
    
    try {
      const prediction = this.model!.predict(tensorInput) as tf.Tensor;
      const fingerprint = await prediction.data();
      return Array.from(fingerprint).join('-');
    } finally {
      tensorInput.dispose();
    }
  }

  private detectBrowser(): string {
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

  private async detectCountry(): Promise<string> {
    if (typeof Intl === 'undefined') return 'unknown';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Simple timezone to country mapping
    const timezoneMap: { [key: string]: string } = {
      'America/New_York': 'United States',
      'America/Los_Angeles': 'United States',
      'Europe/London': 'United Kingdom',
      'Europe/Paris': 'France',
      'Europe/Berlin': 'Germany',
      'Asia/Tokyo': 'Japan',
      'Asia/Shanghai': 'China',
      'Australia/Sydney': 'Australia'
    };

    return timezoneMap[timezone] || 'unknown';
  }

  async detectAnomalies(visitor: VisitorData): Promise<AnomalyScore> {
    if (!this.anomalyModel || !this.isInitialized) {
      await this.initialize();
    }

    try {
      const features = this.extractFeatures(visitor);
      const inputVector = this.concatenateFeatures(features);
      
      // Create tensor and get prediction in a try-finally block
      let tensorInput: tf.Tensor | null = null;
      let reconstruction: tf.Tensor | null = null;
      let error: tf.Tensor | null = null;
      let errorValue = 0;

      try {
        tensorInput = tf.tensor2d([inputVector]);
        reconstruction = this.anomalyModel!.predict(tensorInput) as tf.Tensor;
        error = tf.mean(tf.squaredDifference(tensorInput, reconstruction));
        const errorData = await error.data();
        errorValue = errorData[0];
      } finally {
        // Clean up tensors
        if (tensorInput) tensorInput.dispose();
        if (reconstruction) reconstruction.dispose();
        if (error) error.dispose();
      }

      // Define anomaly threshold (can be adjusted based on your needs)
      const threshold = 0.1;
      const score = errorValue;
      const isAnomaly = score > threshold;

      // Determine reasons for anomaly
      const reasons: string[] = [];
      if (isAnomaly) {
        if (score > threshold * 2) reasons.push('Unusual browser fingerprint');
        if (score > threshold * 1.5) reasons.push('Suspicious screen resolution');
        if (score > threshold * 1.2) reasons.push('Atypical visit time');
      }

      return {
        score,
        threshold,
        isAnomaly,
        reasons
      };
    } catch (error) {
      console.error('Error in anomaly detection:', error);
      return {
        score: 0,
        threshold: 0.1,
        isAnomaly: false,
        reasons: ['Error processing visitor data']
      };
    }
  }

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      // Client-side
      return window.location.origin;
    }
    // Server-side
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  async detectPatterns(visitorData: VisitorData): Promise<{
    peakHours: number[];
    browserPatterns: { [key: string]: number };
    returningVisitorRate: number;
    averageVisitDuration: number;
    anomalies: AnomalyScore[];
  }> {
    try {
      // Initialize with current visitor
      const visitors: VisitorData[] = [visitorData];

      try {
        // Fetch visitor data from API with absolute URL
        const baseUrl = this.getBaseUrl();
        const response = await fetch(`${baseUrl}/api/visitors`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.visitors)) {
            visitors.push(...data.visitors.filter((v: VisitorData) => v.visitorId !== visitorData.visitorId));
          }
        }
      } catch (error) {
        console.warn('Could not fetch historical visitor data:', error);
      }

      // Analyze temporal patterns
      const hourCounts = new Array(24).fill(0);
      visitors.forEach(visitor => {
        const hour = new Date(visitor.timestamp || Date.now()).getHours();
        hourCounts[hour]++;
      });

      // Find peak hours (hours with visits > mean + std)
      const mean = hourCounts.reduce((a, b) => a + b) / 24;
      const std = Math.sqrt(hourCounts.reduce((a, b) => a + Math.pow(b - mean, 2)) / 24);
      const peakHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .filter(({ count }) => count > mean + std)
        .map(({ hour }) => hour);

      // Analyze browser patterns
      const browserCounts = visitors.reduce((acc: { [key: string]: number }, visitor: VisitorData) => {
        const browser = visitor.browser || 'Unknown';
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
      }, {});

      // Calculate returning visitor rate
      const uniqueVisitors = new Set(visitors.map(v => v.visitorId)).size;
      const returningVisitorRate = visitors.length > 1 ? 
        (visitors.length - uniqueVisitors) / visitors.length : 0;

      // Calculate average visit duration
      const visitorDurations = visitors.reduce((acc, visitor) => {
        if (!acc[visitor.visitorId]) {
          acc[visitor.visitorId] = {
            firstVisit: visitor.timestamp || Date.now(),
            lastVisit: visitor.timestamp || Date.now()
          };
        } else {
          acc[visitor.visitorId].lastVisit = Math.max(
            acc[visitor.visitorId].lastVisit,
            visitor.timestamp || Date.now()
          );
        }
        return acc;
      }, {} as { [key: string]: { firstVisit: number; lastVisit: number } });

      const durations = Object.values(visitorDurations)
        .map(({ firstVisit, lastVisit }) => lastVisit - firstVisit)
        .filter(duration => duration > 0);

      const averageVisitDuration = durations.length > 0
        ? durations.reduce((a, b) => a + b) / durations.length
        : 0;

      // Detect anomalies for current visitor
      const anomalyScore = await this.detectAnomalies(visitorData);

      return {
        peakHours,
        browserPatterns: browserCounts,
        returningVisitorRate,
        averageVisitDuration,
        anomalies: [anomalyScore]
      };
    } catch (error) {
      console.error('Error in pattern detection:', error);
      return {
        peakHours: [],
        browserPatterns: {},
        returningVisitorRate: 0,
        averageVisitDuration: 0,
        anomalies: []
      };
    }
  }
} 