'use client';

import { Inter } from 'next/font/google';
import VisitorTracker from '../components/VisitorTracker';
import VisitorProfile from '../components/VisitorProfile';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ShieldCheckIcon, 
  ChartBarSquareIcon,
  BugAntIcon,
  ArrowRightIcon,
  SparklesIcon,
  FingerPrintIcon,
  EyeIcon,
  CircleStackIcon,
  UserGroupIcon,
  KeyIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

const inter = Inter({ subsets: ['latin'] });

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <main className={`min-h-screen ${inter.className}`}>
      {/* Keep VisitorTracker mounted but visually hidden */}
      <VisitorTracker />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-blue-400/20 to-transparent transform rotate-45 blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-indigo-500/20 to-transparent transform -rotate-45 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-6 py-16">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Announcement Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-8"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>Fusion Leap Digital</span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
            >
              Advanced Visitor Identification
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl mb-8 text-blue-100"
            >
              Identify and track anonymous visitors with precision and privacy
            </motion.p>
            <motion.div 
              variants={fadeInUp}
              className="flex gap-4 justify-center"
            >
              <Link 
                href="/analytics" 
                className="group bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all duration-200 inline-flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                View Analytics
                <ArrowRightIcon className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/get-started" 
                className="group bg-transparent border-2 border-white/80 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center backdrop-blur-sm"
              >
                Get Started
                <ArrowRightIcon className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Key Features
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Everything you need to track and analyze your visitors effectively
            </motion.p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: MagnifyingGlassIcon,
                title: "Accurate Identification",
                description: "Advanced fingerprinting technology to identify unique visitors with high accuracy",
                color: "blue",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: ShieldCheckIcon,
                title: "Privacy-First",
                description: "Respect user privacy while maintaining effective visitor tracking",
                color: "indigo",
                gradient: "from-indigo-500 to-violet-600"
              },
              {
                icon: ChartBarSquareIcon,
                title: "Real-time Analytics",
                description: "Get instant insights into visitor behavior and patterns",
                color: "purple",
                gradient: "from-purple-500 to-fuchsia-600"
              },
              {
                icon: BugAntIcon,
                title: "Bot Detection",
                description: "Automatically identify and monitor suspicious bot activities in real-time",
                color: "pink",
                gradient: "from-pink-500 to-rose-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group relative bg-gradient-to-b from-white to-gray-50/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                style={{ cursor: feature.title === "Accurate Identification" || feature.title === "Privacy-First" || feature.title === "Real-time Analytics" || feature.title === "Bot Detection" ? "pointer" : "default" }}
              >
                {feature.title === "Accurate Identification" ? (
                  <Link href="/privacy#machine-learning-fingerprinting" className="absolute inset-0 z-10" aria-label="Learn more about Machine Learning Fingerprinting" />
                ) : feature.title === "Privacy-First" ? (
                  <Link href="/privacy#privacy-first-approach" className="absolute inset-0 z-10" aria-label="Learn more about our Privacy-First Approach" />
                ) : feature.title === "Real-time Analytics" ? (
                  <Link href="/analytics" className="absolute inset-0 z-10" aria-label="View Real-time Analytics" />
                ) : feature.title === "Bot Detection" ? (
                  <Link
                    href="/analytics#anomaly-detection"
                    className="absolute inset-0 z-10"
                    aria-label="View Bot Detection in Analytics"
                    onClick={(e) => {
                      e.preventDefault();
                      // Navigate programmatically with a small delay to ensure DOM is ready
                      window.location.href = "/analytics#anomaly-detection";
                      
                      // For users already on the analytics page
                      const isAlreadyOnAnalyticsPage = window.location.pathname.includes('/analytics');
                      if (isAlreadyOnAnalyticsPage) {
                        e.preventDefault();
                        const element = document.getElementById('anomaly-detection');
                        if (element) {
                          setTimeout(() => {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }
                      }
                    }}
                  />
                ) : null}
                <div className="flex justify-center mb-6 relative">
                  {/* Gradient background blur effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-20 group-hover:opacity-30 blur-2xl transition-all duration-300 rounded-full`} />
                  
                  {/* Icon container with gradient */}
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg shadow-${feature.color}-500/20 group-hover:shadow-xl group-hover:shadow-${feature.color}-500/30 transition-all duration-300 p-0.5`}>
                    <div className="absolute inset-0.5 bg-white rounded-xl" />
                    <feature.icon className={`relative h-full w-full p-3 text-${feature.color}-600 group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 text-center group-hover:text-${feature.color}-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              How It Works
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Simple integration, powerful results
            </motion.p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl mx-auto"
          >
            <div className="space-y-20">
              {[
                {
                  step: 1,
                  title: "Visitor Detection",
                  description: "Our system automatically detects and analyzes visitor characteristics",
                  icon: EyeIcon,
                  color: "blue"
                },
                {
                  step: 2,
                  title: "Fingerprint Generation",
                  description: "Creates a unique digital fingerprint based on multiple data points",
                  icon: KeyIcon,
                  color: "blue"
                },
                {
                  step: 3,
                  title: "Pattern Recognition",
                  description: "Identifies returning visitors and analyzes behavior patterns",
                  icon: SignalIcon,
                  color: "blue"
                }
              ].map((step, index) => (
                <motion.div 
                  key={step.step}
                  variants={fadeInUp}
                  className="flex items-center group relative"
                >
                  <div className="relative">
                    {/* Icon container */}
                    <div className="relative w-[72px] h-[72px] flex-shrink-0">
                      {/* Background square with shadow */}
                      <div className="absolute inset-0 bg-blue-600 rounded-[20px] shadow-lg" />
                      
                      {/* Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Connecting line */}
                    {index < 2 && (
                      <div className="absolute top-[72px] left-1/2 w-[2px] h-[52px] bg-blue-600/20 -translate-x-1/2" />
                    )}
                  </div>

                  {/* Text content */}
                  <div className="ml-6">
                    <h3 className="text-[22px] font-semibold mb-1 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-[17px] text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visitor Profile Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="container mx-auto px-6"
        >
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Your Visitor Profile
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how our system identifies and tracks visitors in real-time
            </p>
          </motion.div>
          <motion.div 
            variants={fadeInUp}
            className="max-w-2xl mx-auto"
          >
            <VisitorProfile />
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-blue-400/20 to-transparent transform rotate-45 blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-indigo-500/20 to-transparent transform -rotate-45 blur-3xl" />
        </div>

        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="container relative mx-auto px-6 text-center"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl mb-8 text-blue-100"
          >
            Start identifying your visitors today with our powerful tracking solution
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link 
              href="/get-started" 
              className="group bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all duration-200 inline-flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              Start Free Trial
              <ArrowRightIcon className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Fusion Leap Digital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
