'use client';

import { useState } from 'react';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';

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
    price: { monthly: '$29' },
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
    price: { monthly: '$99' },
    description: 'For large enterprises requiring advanced features.',
    features: [
      'Unlimited monthly visitors',
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
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      <div className="relative isolate px-6 pt-20 lg:px-8">
        <div className="mx-auto max-w-7xl py-12 sm:py-16 lg:py-20">
          {/* Hero Section */}
          <div className="text-center text-white mb-16">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Get Started with FusionLeap
            </h1>
            <p className="mt-6 text-lg leading-8 mx-auto max-w-2xl">
              Choose the perfect plan for your needs and start tracking visitors anonymously today.
            </p>
          </div>

          {/* Pricing Tiers - Adjust grid for Safari */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`flex flex-col rounded-3xl p-8 ring-1 ring-white/10 ${
                    tier.mostPopular
                      ? 'bg-white text-gray-900'
                      : 'bg-white/5 text-white'
                  }`}
                >
                  <div className="flex-1">
                    <h2
                      className={`text-2xl font-bold ${
                        tier.mostPopular ? 'text-gray-900' : 'text-white'
                      }`}
                    >
                      {tier.name}
                    </h2>
                    
                    {tier.mostPopular && (
                      <p className="mt-4 text-sm text-blue-600">Most popular</p>
                    )}
                    
                    <p
                      className={`mt-4 text-sm ${
                        tier.mostPopular ? 'text-gray-600' : 'text-gray-300'
                      }`}
                    >
                      {tier.description}
                    </p>
                    
                    <div className="mt-6 flex items-baseline gap-x-1">
                      <span
                        className={`text-4xl font-bold tracking-tight ${
                          tier.mostPopular ? 'text-gray-900' : 'text-white'
                        }`}
                      >
                        {tier.price.monthly}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          tier.mostPopular ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      >
                        /month
                      </span>
                    </div>

                    <ul
                      className={`mt-8 space-y-3 text-sm leading-6 ${
                        tier.mostPopular ? 'text-gray-600' : 'text-gray-300'
                      }`}
                    >
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-x-3">
                          <CheckIcon
                            className={`h-6 w-5 flex-none ${
                              tier.mostPopular ? 'text-blue-600' : 'text-white'
                            }`}
                            aria-hidden="true"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={tier.href}
                    className={`mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      tier.mostPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                        : 'bg-white text-blue-600 hover:bg-gray-100 focus-visible:outline-white'
                    }`}
                  >
                    {tier.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Guide */}
          <div className="mx-auto mt-24 max-w-3xl text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight">
              Simple Integration
            </h2>
            <p className="mt-4 text-lg">
              Add just a few lines of code to start tracking visitors anonymously:
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl bg-[#2643B5] backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-3 bg-[#1E3A9F]">
                <div className="text-base font-medium text-white">HTML</div>
                <button 
                  className="text-base text-white/90 hover:text-white transition-colors flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-blue-600/30" 
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-5 w-5" />
                      Copy code
                    </>
                  )}
                </button>
              </div>
              <div className="p-8 text-[15px] leading-7 text-white font-mono">
                <pre className="text-left whitespace-pre"><code>{codeSnippet}</code></pre>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/80">
              Need help? Check out our <a href="#" className="text-white hover:text-white/90 underline">detailed integration guide</a> or <a href="#" className="text-white hover:text-white/90 underline">contact support</a>.
            </p>
          </div>

          {/* FAQ Section - Adjust for Safari */}
          <div className="mx-auto mt-24 max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-8">
              <div className="text-white">
                <dt className="text-lg font-semibold">
                  How does anonymous tracking work?
                </dt>
                <dd className="mt-3 text-gray-300">
                  Our system uses advanced fingerprinting and ML techniques to track visitors without collecting personal data. We generate unique, anonymous identifiers that maintain privacy while providing valuable insights.
                </dd>
              </div>
              <div className="text-white">
                <dt className="text-lg font-semibold">
                  What data is collected?
                </dt>
                <dd className="mt-3 text-gray-300">
                  We collect only non-personal data such as browser type, screen resolution, and visit patterns. No IP addresses, cookies, or personal identifiers are stored.
                </dd>
              </div>
              <div className="text-white">
                <dt className="text-lg font-semibold">
                  Can I upgrade or downgrade my plan?
                </dt>
                <dd className="mt-3 text-gray-300">
                  Yes, you can change your plan at any time. When upgrading, you'll be prorated for the remainder of the billing period. When downgrading, the new rate will apply to your next billing cycle.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 