import { Inter } from 'next/font/google';
import VisitorTracker from '../components/VisitorTracker';
import VisitorProfile from '../components/VisitorProfile';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  ShieldCheckIcon, 
  ChartBarSquareIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className={`min-h-screen ${inter.className}`}>
      {/* Keep VisitorTracker mounted but visually hidden */}
      <VisitorTracker />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Advanced Visitor Identification
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Identify and track anonymous visitors with precision and privacy
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/analytics" className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center">
                View Analytics
              </Link>
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <div className="flex justify-center mb-4">
                <MagnifyingGlassIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Accurate Identification</h3>
              <p className="text-gray-600 text-center">
                Advanced fingerprinting technology to identify unique visitors with high accuracy
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <div className="flex justify-center mb-4">
                <ShieldCheckIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Privacy-First</h3>
              <p className="text-gray-600 text-center">
                Respect user privacy while maintaining effective visitor tracking
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <div className="flex justify-center mb-4">
                <ChartBarSquareIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Real-time Analytics</h3>
              <p className="text-gray-600 text-center">
                Get instant insights into visitor behavior and patterns
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <div className="flex justify-center mb-4">
                <BugAntIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Bot Detection</h3>
              <p className="text-gray-600 text-center">
                Automatically identify and monitor suspicious bot activities in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">Visitor Detection</h3>
                  <p className="text-gray-600">Our system automatically detects and analyzes visitor characteristics</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">Fingerprint Generation</h3>
                  <p className="text-gray-600">Creates a unique digital fingerprint based on multiple data points</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">Pattern Recognition</h3>
                  <p className="text-gray-600">Identifies returning visitors and analyzes behavior patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visitor Profile Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <VisitorProfile />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Start identifying your visitors today</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
            Start Free Trial
          </button>
        </div>
      </section>
    </main>
  );
}
