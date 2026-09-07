'use client';

import Header from '@/components/customer/Header';
import SimpleFooter from '@/components/customer/SimpleFooter';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PRODUCTS } from '@/lib/data/products';
import { syncLiveProducts } from '@/lib/products-store';
import { shouldFlipImageToFaceLeft } from '@/lib/utils';

type TabType = 'scooter' | 'bike';

const toListItem = (product: (typeof PRODUCTS)[number]) => ({
  id: product.id,
  name: product.name,
  capacity: product.specifications.capacity || '',
  image: product.image,
  slug: product.slug,
  isNew: product.isNew || false
});

const computeScooters = () => PRODUCTS.filter(product => product.category === 'scooter').map(toListItem);
const computeBikes = () => PRODUCTS.filter(product => product.category === 'bike').map(toListItem);

export default function AllModelsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('scooter');
  const [showScooterDropdown, setShowScooterDropdown] = useState(false);
  const [showBikeDropdown, setShowBikeDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [scooters, setScooters] = useState(computeScooters());
  const [bikes, setBikes] = useState(computeBikes());

  useEffect(() => {
    syncLiveProducts().then(() => {
      setScooters(computeScooters());
      setBikes(computeBikes());
    });
  }, []);

  const products = activeTab === 'scooter' ? scooters : bikes;
  const title = activeTab === 'scooter' ? 'SCOOTER' : 'BIKE';

  // Pagination logic
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#3a3a3a' }}>
      <Header />

      {/* Black section from top — covers the header area so no gray shows above banner */}
      <div style={{ backgroundColor: '#000', paddingTop: '64px' }}>

        {/* Banner image — show bottom portion prominently */}
        <div
          style={{
            width: '100%',
            height: '280px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              backgroundImage: 'url("/top_banner2.jpg")',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center 70%',
              width: '100%',
              height: '140%',
              position: 'absolute',
              top: '-30%',
              left: 0,
            }}
          />
        </div>
      </div> {/* end black top section */}

      {/* ── White content box: overlaps banner, cut from left ── */}
      <div
        style={{
          backgroundColor: '#fff',
          marginLeft: '220px',        /* wider gray visible on left */
          marginTop: '-40px',         /* overlap the banner from below */
          position: 'relative',
          zIndex: 10,
          minHeight: '600px',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
        }}
      >
        {/* Title + Sub-nav row — exact SYM Global .page-container layout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: '2px solid #e0e0e0',
            minHeight: '80px',
          }}
        >
          {/* Left col (~33%) — page title + breadcrumb, like .col-lg-4 */}
          <div
            style={{
              flex: '0 0 33%',
              padding: '20px 24px 20px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRight: '1px solid #e0e0e0',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '900',
                color: '#e31e24',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: 0,
                lineHeight: 1,
              }}
            >
              {title}
            </h1>
            <nav style={{ marginTop: '5px', fontSize: '11px', color: '#aaa', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }} className="hover:text-[#e31e24] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/products" style={{ color: '#aaa', textDecoration: 'none' }} className="hover:text-[#e31e24] transition-colors">Product</Link>
              <span>/</span>
              <span style={{ color: '#555' }}>{title}</span>
            </nav>
          </div>

          {/* Right col (~67%) — sub-nav tabs, like .col-lg-8 .sub-nav */}
          <div
            style={{
              flex: '1',
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
            {(['scooter', 'bike'] as TabType[]).map((tab) => (
              <div
                key={tab}
                style={{ position: 'relative' }}
                onMouseEnter={() => tab === 'scooter' ? setShowScooterDropdown(true) : setShowBikeDropdown(true)}
                onMouseLeave={() => tab === 'scooter' ? setShowScooterDropdown(false) : setShowBikeDropdown(false)}
              >
                <button
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1); // Reset to first page when switching tabs
                  }}
                  style={{
                    position: 'relative',
                    padding: '0 44px',
                    fontSize: '13px',
                    fontWeight: '700',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRight: '1px solid #e0e0e0',
                    background: activeTab === tab ? '#fff' : '#f5f5f5',
                    color: activeTab === tab ? '#222' : '#888',
                    cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    height: '100%',
                  }}
                >
                  {tab === 'scooter' ? 'SCOOTER' : 'BIKE'}
                  <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
                  {/* Active red bottom indicator */}
                  {activeTab === tab && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: 0,
                        right: 0,
                        height: '3px',
                        backgroundColor: '#e31e24',
                        zIndex: 1,
                      }}
                    />
                  )}
                </button>

                {/* Dropdown Menu */}
                {tab === 'scooter' && showScooterDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 100,
                      minWidth: '200px',
                      borderTop: '3px solid #e31e24',
                    }}
                  >
                    <Link
                      href="/products/scooter/all"
                      style={{
                        display: 'block',
                        padding: '16px 24px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#555',
                        textDecoration: 'none',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                        e.currentTarget.style.color = '#e31e24';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = '#555';
                      }}
                    >
                      All Models
                    </Link>
                    <Link
                      href="/products/scooter/over-125cc"
                      style={{
                        display: 'block',
                        padding: '16px 24px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#555',
                        textDecoration: 'none',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                        e.currentTarget.style.color = '#e31e24';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = '#555';
                      }}
                    >
                      Over 125cc
                    </Link>
                    <Link
                      href="/products/scooter/125cc"
                      style={{
                        display: 'block',
                        padding: '16px 24px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#555',
                        textDecoration: 'none',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                        e.currentTarget.style.color = '#e31e24';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = '#555';
                      }}
                    >
                      125cc
                    </Link>
                    <Link
                      href="/products/scooter/50cc"
                      style={{
                        display: 'block',
                        padding: '16px 24px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#555',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                        e.currentTarget.style.color = '#e31e24';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = '#555';
                      }}
                    >
                      50cc
                    </Link>
                  </div>
                )}

                {/* Bike Dropdown Menu */}
                {tab === 'bike' && showBikeDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 100,
                      minWidth: '200px',
                      borderTop: '3px solid #e31e24',
                    }}
                  >
                    <Link
                      href="/products/bike/all"
                      style={{
                        display: 'block',
                        padding: '16px 24px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#555',
                        textDecoration: 'none',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                        e.currentTarget.style.color = '#e31e24';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = '#555';
                      }}
                    >
                      All Models
                    </Link>
                    <Link
                      href="/products/bike/over-125cc"
                      style={{
                        display: 'block',
                        padding: '16px 24px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#555',
                        textDecoration: 'none',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                        e.currentTarget.style.color = '#e31e24';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = '#555';
                      }}
                    >
                      Over 125cc
                    </Link>
                    <Link
                      href="/products/bike/125cc"
                      style={{
                        display: 'block',
                        padding: '16px 24px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#555',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                        e.currentTarget.style.color = '#e31e24';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = '#555';
                      }}
                    >
                      125cc
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Grid — inside the white box, 3 columns layout like original SYM site */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            borderTop: '1px solid #e5e5e5',
            paddingTop: '40px',
          }}
        >
          {currentProducts.map((product, i) => (
            <div
              key={product.id}
              style={{
                position: 'relative',
                borderRight: (i + 1) % 3 !== 0 ? '1px solid #e5e5e5' : 'none',
                borderBottom: Math.floor(i / 3) < Math.floor((currentProducts.length - 1) / 3) ? '1px solid #e5e5e5' : 'none',
                backgroundColor: '#fff',
                overflow: 'visible',
                paddingTop: '30px',
                paddingBottom: '30px',
              }}
            >
              <Link
                href={`/products/${product.slug}`}
                className="group block"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  height: '100%',
                }}
              >


                {/* Product Image Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '280px',
                    overflow: 'visible',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 20px',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '110%',
                      height: '110%',
                      transform: 'scale(1.05)',
                      transition: 'transform 0.6s ease-out',
                    }}
                    className="group-hover:scale-130"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                      style={{
                        filter: 'brightness(1) contrast(1.05)',
                        transform: shouldFlipImageToFaceLeft(product.image) ? 'scaleX(-1)' : 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Product Info - Text below image */}
                <div
                  style={{
                    padding: '16px 24px 24px',
                    textAlign: 'center',
                    borderTop: '1px solid #f5f5f5',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '900',
                      color: '#2c2c2c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      margin: '0 0 8px 0',
                      lineHeight: '1.2',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                    className="group-hover:text-[#e31e24] transition-colors duration-300"
                  >
                    {product.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '15px',
                      color: '#666',
                      margin: 0,
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {product.capacity}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              padding: '40px 24px',
            }}
          >
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid #e0e0e0',
                backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                color: currentPage === 1 ? '#ccc' : '#666',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  e.currentTarget.style.borderColor = '#e31e24';
                  e.currentTarget.style.color = '#e31e24';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              ←
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #e0e0e0',
                  backgroundColor: currentPage === pageNum ? '#e31e24' : '#fff',
                  color: currentPage === pageNum ? '#fff' : '#666',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== pageNum) {
                    e.currentTarget.style.borderColor = '#e31e24';
                    e.currentTarget.style.color = '#e31e24';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== pageNum) {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.color = '#666';
                  }
                }}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid #e0e0e0',
                backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                color: currentPage === totalPages ? '#ccc' : '#666',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.currentTarget.style.borderColor = '#e31e24';
                  e.currentTarget.style.color = '#e31e24';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* bottom padding to show gray background */}
      <div style={{ height: '60px' }} />

      {/* SimpleFooter */}
      <SimpleFooter />
    </div>
  );
}