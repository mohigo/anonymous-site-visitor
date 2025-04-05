'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Privacy', href: '/privacy' },
];

export default function Navigation() {
  const pathname = usePathname();

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
            <span className="text-lg font-semibold text-gray-900">FusionLeap</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold ${
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 transition-colors'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/get-started"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 