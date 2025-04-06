'use client';

import { useState } from 'react';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const tiers = [
  {
    name: 'Free',
    id: 'free',
    href: '#',
    price: { monthly: '$0' },
    description: 'Perfect for personal projects and small websites.',
    features: [
      'Up to 1,000 monthly visitors',
      'Basic visitor analytics',
      'Browser & device tracking',
      'Simple bot detection',
      'Community support'
    ],
    cta: 'Start Free',
    mostPopular: false,
  },
  {
    name: 'Pro',
    id: 'pro',
    href: '#',
    price: { monthly: '$99' },
    description: 'Ideal for growing businesses and startups.',
    features: [
      'Up to 50,000 monthly visitors',
      'Advanced analytics dashboard',
      'Real-time visitor tracking',
      'ML-powered bot detection',
      'Custom event tracking',
      'Email support',
      'API access'
    ],
    cta: 'Start Pro Trial',
    mostPopular: true,
  },
  {
    name: 'Business',
    id: 'business',
    href: '#',
    price: { monthly: '$1,999' },
    description: 'For enterprises with high-volume traffic needs.',
    features: [
      'Pay per million visitors/month',
      'Enterprise analytics dashboard',
      'Advanced ML insights',
      'Custom integration support',
      'Dedicated account manager',
      '24/7 priority support',
      'Full API access',
      'Custom reporting',
      'SLA guarantee'
    ],
    cta: 'Contact Sales',
    mostPopular: false,
  },
];

export default function GetStartedPage() {
  const [copied, setCopied] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const codeSnippet = `<script src="https://cdn.fusionleap.dev/tracker.js"></script>

<script>
  FusionLeap.init({
    siteId: 'YOUR_SITE_ID',
    options: {
      privacy: true,
      analytics: true
    }
  });
</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-blue-400/20 to-transparent transform rotate-45 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-blue-500/20 to-transparent transform -rotate-45 blur-3xl" />
      </div>

      <div className="relative isolate px-6 pt-20 lg:px-8">
        <div className="mx-auto max-w-7xl py-12 sm:py-16 lg:py-20">
          {/* Hero Section */}
          <motion.div 
            className="text-center text-white mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Get Started with FusionLeap
            </h1>
            <p className="mt-6 text-lg leading-8 mx-auto max-w-2xl text-blue-100">
              Choose the perfect plan for your needs and start tracking visitors anonymously today
            </p>
          </motion.div>

          {/* Pricing Tiers */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 gap-8 sm:gap-6 lg:grid-cols-3 lg:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  onHoverStart={() => setHoveredTier(tier.id)}
                  onHoverEnd={() => setHoveredTier(null)}
                  className={`flex flex-col rounded-3xl p-8 ring-1 backdrop-blur-sm
                    ${tier.mostPopular 
                      ? 'bg-gradient-to-b from-white/95 to-indigo-50/95 text-gray-900 ring-indigo-500 shadow-lg shadow-indigo-500/20' 
                      : 'bg-white/10 text-white ring-white/20 hover:bg-white/15 transition-colors'}
                    ${hoveredTier === tier.id ? 'transform scale-105 transition-transform' : 'transform scale-100 transition-transform'}
                  `}
                >
                  <div className="flex-1">
                    <h2 className={`text-2xl font-bold ${tier.mostPopular ? 'text-gray-900' : 'text-white'}`}>
                      {tier.name}
                    </h2>
                    
                    {tier.mostPopular && (
                      <p className="mt-4 text-sm text-indigo-600 font-semibold">
                        Most popular
                      </p>
                    )}
                    
                    <p className={`mt-4 text-sm ${tier.mostPopular ? 'text-gray-600' : 'text-blue-100'}`}>
                      {tier.description}
                    </p>
                    
                    <div className="mt-6 flex items-baseline gap-x-1">
                      <span className={`text-4xl font-bold tracking-tight ${tier.mostPopular ? 'text-gray-900' : 'text-white'}`}>
                        {tier.price.monthly}
                      </span>
                      <span className={`text-sm font-semibold ${tier.mostPopular ? 'text-gray-600' : 'text-blue-200'}`}>
                        /month
                      </span>
                    </div>

                    <ul className={`mt-8 space-y-3 text-sm leading-6 ${tier.mostPopular ? 'text-gray-600' : 'text-blue-100'}`}>
                      {tier.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={feature} 
                          className="flex items-start gap-x-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                        >
                          <CheckIcon
                            className={`h-6 w-5 flex-none ${tier.mostPopular ? 'text-indigo-600' : 'text-blue-300'}`}
                            aria-hidden="true"
                          />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <motion.a
                    href={tier.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-200
                      ${tier.mostPopular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 shadow-lg shadow-indigo-500/50'
                        : 'bg-white text-blue-600 hover:bg-blue-50 focus-visible:outline-white'
                      }`}
                  >
                    {tier.cta}
                  </motion.a>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Integration Guide */}
          <motion.div 
            className="mx-auto mt-24 max-w-3xl text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Simple Integration
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Add just a few lines of code to start tracking visitors anonymously:
            </p>
            <motion.div 
              className="mt-8 overflow-hidden rounded-2xl bg-[#1a2942]/80 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-6 py-3 bg-[#1E3A9F]/80 border-b border-white/10">
                <div className="text-base font-medium text-white">HTML</div>
                <motion.button 
                  className="text-base text-white/90 hover:text-white transition-colors flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-blue-600/30" 
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-5 w-5" />
                      <span>Copy code</span>
                    </>
                  )}
                </motion.button>
              </div>
              <div className="p-8 text-[15px] leading-7 text-blue-100 font-mono">
                <pre className="text-left whitespace-pre"><code>{codeSnippet}</code></pre>
              </div>
            </motion.div>
            <p className="mt-6 text-sm text-blue-200">
              Need help? Check out our{' '}
              <a href="#" className="text-white hover:text-blue-100 underline underline-offset-2 transition-colors">
                detailed integration guide
              </a>{' '}
              or{' '}
              <a href="#" className="text-white hover:text-blue-100 underline underline-offset-2 transition-colors">
                contact support
              </a>.
            </p>
          </motion.div>

          {/* FAQ Section */}
          <motion.div 
            className="mx-auto mt-24 max-w-4xl px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-8">
              {[
                {
                  question: "How does anonymous tracking work?",
                  answer: "Our system uses advanced fingerprinting and ML techniques to track visitors without collecting personal data. We generate unique, anonymous identifiers that maintain privacy while providing valuable insights."
                },
                {
                  question: "What data is collected?",
                  answer: "We collect only non-personal data such as browser type, screen resolution, and visit patterns. No IP addresses, cookies, or personal identifiers are stored."
                },
                {
                  question: "Can I upgrade or downgrade my plan?",
                  answer: "Yes, you can change your plan at any time. When upgrading, you'll be prorated for the remainder of the billing period. When downgrading, the new rate will apply to your next billing cycle."
                }
              ].map((faq, index) => (
                <motion.div 
                  key={index}
                  className="text-white p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.9 }}
                >
                  <dt className="text-lg font-semibold text-blue-100">
                    {faq.question}
                  </dt>
                  <dd className="mt-3 text-blue-200">
                    {faq.answer}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 