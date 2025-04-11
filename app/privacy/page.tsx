'use client';

import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  FingerPrintIcon, 
  DocumentTextIcon,
  UserGroupIcon,
  LockClosedIcon,
  ServerIcon,
  EyeSlashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <motion.div 
          className="container mx-auto px-4 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <ShieldCheckIcon className="h-16 w-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Privacy-First Analytics
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Learn how we balance powerful analytics with user privacy through advanced 
              machine learning and ethical data practices.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="max-w-4xl mx-auto space-y-16"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Privacy Approach Section */}
          <motion.section variants={fadeIn} id="privacy-first-approach" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Our Privacy-First Approach</h2>
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="flex items-center mb-4">
                  <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">No Personal Data Collection</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We never collect personally identifiable information (PII) such as names, 
                  emails, or IP addresses. Our analytics are based purely on anonymous 
                  behavioral patterns and device characteristics.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="flex items-center mb-4">
                  <LockClosedIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Data Minimization</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We collect only the minimum data necessary for analytics. All data is 
                  anonymized and aggregated before being stored or analyzed.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Machine Learning Section */}
          <motion.section variants={fadeIn} id="machine-learning-fingerprinting" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Machine Learning Fingerprinting</h2>
              <FingerPrintIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center mb-4">
                    <ServerIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">How It Works</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Our fingerprinting technology uses a combination of device characteristics 
                    and behavioral patterns to create a unique, anonymous identifier for each 
                    visitor. This is done without storing any personal information.
                  </p>
                  <div className="flex items-center mb-4">
                    <EyeSlashIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Privacy Safeguards</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    All fingerprinting data is hashed and anonymized. We use probabilistic 
                    data structures to prevent reverse engineering of visitor identities.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-4">
                    <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Data Points Used</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Browser settings and capabilities',
                      'Screen resolution and color depth',
                      'Installed fonts and plugins (without enumeration)',
                      'Time zone',
                      'Language preferences'
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="h-2 w-2 bg-blue-600 rounded-full mr-3" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* User Control Section */}
          <motion.section variants={fadeIn} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">User Control & Rights</h2>
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Privacy Choices</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mt-1">✓</div>
                    <p className="ml-4 text-gray-600">Opt out of tracking at any time</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mt-1">✓</div>
                    <p className="ml-4 text-gray-600">Request data deletion</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mt-1">✓</div>
                    <p className="ml-4 text-gray-600">Control data collection preferences</p>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Commitments</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mt-1">✓</div>
                    <p className="ml-4 text-gray-600">Respect for DNT (Do Not Track) headers</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mt-1">✓</div>
                    <p className="ml-4 text-gray-600">Regular privacy audits</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mt-1">✓</div>
                    <p className="ml-4 text-gray-600">Transparent data practices</p>
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
} 