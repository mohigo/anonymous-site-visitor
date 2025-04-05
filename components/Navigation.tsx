import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Company Name */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src="/apple-icon.png"
                alt="Company Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-semibold text-gray-900">Fusion Leap</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/analytics" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Analytics
            </Link>
            <Link 
              href="/privacy" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 