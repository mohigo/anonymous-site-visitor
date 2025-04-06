import * as tf from '@tensorflow/tfjs';
import { VisitorData } from './types';
import { detectCountry } from './geolocation';

interface FeatureVector {
  userAgentHash: number;
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
  private readonly vectorSize = 16;
  private isInitialized = false;
  private isInitializing = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize() {
    if (this.model) return;
    if (this.isInitializing) {
      // Wait for existing initialization to complete
      await this.initializationPromise;
      return;
    }

    this.isInitializing = true;
    this.initializationPromise = (async () => {
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
              inputShape: [this.vectorSize],
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
              inputShape: [this.vectorSize],
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
              units: this.vectorSize,
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
      } finally {
        this.isInitializing = false;
      }
    })();

    await this.initializationPromise;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to [0,1]
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
        browser === 'Unknown' ? 1 : 0,
        this.hashString(visitor.country + visitor.countryCode) // Add geolocation feature
      ]
    };
  }

  private concatenateFeatures(features: FeatureVector): number[] {
    return [
      features.userAgentHash,
      ...features.screenFeatures,
      ...features.timeFeatures,
      ...features.browserFeatures
    ];
  }

  public async generateFingerprint(): Promise<string> {
    if (!this.model) {
      await this.initialize();
    }

    const getScreenResolution = () => {
      if (typeof window === 'undefined') return '1920x1080';
      return `${window.screen?.width || 1920}x${window.screen?.height || 1080}`;
    };

    // Get geolocation data
    const geoData = await detectCountry();

    const visitorData: VisitorData = {
      visitorId: crypto.randomUUID(),
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitCount: 1,
      browser: this.detectBrowser(),
      country: geoData.country,
      countryCode: geoData.countryCode,
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

  public async detectPatterns(visitorData: VisitorData): Promise<{
    behaviorPatterns: string[];
    anomalyScore: {
      isAnomaly: boolean;
      confidence: number;
    };
  }> {
    // Ensure model is initialized
    if (!this.model) {
      await this.initialize();
      if (!this.model) {
        console.warn('Failed to initialize ML model');
        return {
          behaviorPatterns: ['Model initialization failed'],
          anomalyScore: {
            isAnomaly: false,
            confidence: 0
          }
        };
      }
    }

    const features = this.extractFeatures(visitorData);
    const inputVector = this.concatenateFeatures(features);
    const tensorInput = tf.tensor2d([inputVector]);

    try {
      const prediction = this.model.predict(tensorInput) as tf.Tensor;
      const score = (await prediction.data())[0];

      const patterns: string[] = [];
      if (score > 0.8) patterns.push('Likely bot or automated traffic');
      if (score < 0.2) patterns.push('Likely genuine user');
      if (visitorData.visitCount > 10) patterns.push('Frequent visitor');
      
      return {
        behaviorPatterns: patterns,
        anomalyScore: {
          isAnomaly: score > 0.7,
          confidence: score
        }
      };
    } finally {
      tensorInput.dispose();
    }
  }
} 