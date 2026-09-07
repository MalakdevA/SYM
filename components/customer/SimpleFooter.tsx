'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function SimpleFooter() {
  return (
    <footer className="relative w-full" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="mx-auto" style={{ maxWidth: '1440px', padding: '100px 50px' }}>

        {/* Logo and Breadcrumb */}
        <div className="mb-24">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/assets/brand/sym-logo-red.png"
                alt="SYM Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain"
              />
              <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.47021 7.3252L0.998535 11.7646L0.000488281 10.7656L4.49268 6.27344H5.47021V7.3252ZM5.47021 4.77441V5.8418H4.56982L0.0776367 1.34961L1.07568 0.351562L5.47021 4.77441Z" fill="#86868B" />
              </svg>
              <span className="text-gray-400">Home</span>
            </Link>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-20 mb-40">

          {/* Product Categories Column */}
          <div>
            <h3 className="text-white font-normal text-sm mb-6">Product Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products/scooter/all"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  All Scooters
                </Link>
              </li>
              <li>
                <Link
                  href="/products/scooter/over-125cc"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Over 125cc
                </Link>
              </li>
              <li>
                <Link
                  href="/products/scooter/125cc"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  125cc
                </Link>
              </li>
              <li>
                <Link
                  href="/products/bike/all"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  All Bikes
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <Link href="/support" className="text-white font-normal text-sm hover:text-gray-300 transition-colors">
              Support
            </Link>
            <ul className="space-y-3 mt-6">
              <li>
                <Link
                  href="/warranty"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Warranty Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <Link href="/about" className="text-white font-normal text-sm hover:text-gray-300 transition-colors">
              About
            </Link>
            <ul className="space-y-3 mt-6">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/dealers"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Where to Buy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div>
            <Link href="/contact" className="text-white font-normal text-sm hover:text-gray-300 transition-colors">
              Contact Us
            </Link>
            <ul className="space-y-3 mt-6">
              <li>
                <a
                  href="mailto:info@sym-egypt.com"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  info@sym-egypt.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}