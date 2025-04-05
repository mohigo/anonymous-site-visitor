'use client';

import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Privacy-First Analytics</h1>
            <p className="text-xl opacity-90">
              Learn how we balance powerful analytics with user privacy through advanced machine learning and ethical data practices.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Privacy Approach Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Privacy-First Approach</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">No Personal Data Collection</h3>
                  <p className="text-gray-600">
                    We never collect personally identifiable information (PII) such as names, emails, or IP addresses. 
                    Our analytics are based purely on anonymous behavioral patterns and device characteristics.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Minimization</h3>
                  <p className="text-gray-600">
                    We collect only the minimum data necessary for analytics. All data is anonymized and aggregated 
                    before being stored or analyzed.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User Control</h3>
                  <p className="text-gray-600">
                    Users can opt out of tracking at any time, and we respect browser privacy settings and DNT (Do Not Track) headers.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Machine Learning Fingerprinting Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Machine Learning Fingerprinting</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">How It Works</h3>
                  <p className="text-gray-600">
                    Our fingerprinting technology uses a combination of device characteristics and behavioral patterns 
                    to create a unique, anonymous identifier for each visitor. This is done without storing any personal information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Points Used</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Browser settings and capabilities</li>
                    <li>Screen resolution and color depth</li>
                    <li>Installed fonts and plugins (without enumeration)</li>
                    <li>Time zone</li>
                    <li>Language preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Safeguards</h3>
                  <p className="text-gray-600">
                    All fingerprinting data is hashed and anonymized. We use probabilistic data structures to 
                    prevent reverse engineering of visitor identities.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Anomaly Detection Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Anomaly Detection System</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Real-time Pattern Analysis</h3>
                  <p className="text-gray-600">
                    Our system continuously analyzes visitor behavior patterns to detect unusual activity 
                    that might indicate automated bots or suspicious behavior.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Detection Methods</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Behavioral pattern analysis</li>
                    <li>Time-based activity monitoring</li>
                    <li>Geographic anomaly detection</li>
                    <li>Device fingerprint consistency checks</li>
                    <li>Session pattern analysis</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Machine Learning Models</h3>
                  <p className="text-gray-600">
                    We use advanced machine learning models including isolation forests and autoencoders to 
                    identify anomalies while maintaining user privacy. These models are trained on anonymous, 
                    aggregated data to ensure individual privacy is protected.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Compliance Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Compliance</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Regulatory Compliance</h3>
                  <p className="text-gray-600">
                    Our analytics system is designed to comply with major privacy regulations including GDPR, 
                    CCPA, and PECR. We maintain transparency about our data collection and processing methods.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Retention</h3>
                  <p className="text-gray-600">
                    Visitor data is automatically purged after 30 days, and aggregated analytics data is kept 
                    for a maximum of 90 days. Users can request immediate data deletion at any time.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 