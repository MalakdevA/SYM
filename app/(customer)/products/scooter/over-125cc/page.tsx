'use client';

import Header from '@/components/customer/Header';
import SimpleFooter from '@/components/customer/SimpleFooter';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PRODUCTS } from '@/lib/data/products';
import { syncLiveProducts } from '@/lib/products-store';
import { shouldFlipImageToFaceLeft } from '@/lib/utils';

// Filter scooters with capacity over 125cc
const computeScooters = () => PRODUCTS.filter(product => {
  if (product.category !== 'scooter') return false;

  const capacity = product.specifications.capacity;
  if (!capacity) return false;

  const ccValue = parseInt(capacity.replace(/[^\d]/g, ''));
  return ccValue > 125;
}).map(product => ({
  id: product.id,
  name: product.name,
  capacity: product.specifications.capacity || '',
  image: product.image,
  slug: product.slug,
  isNew: product.isNew || false
}));

export default function Over125ccPage() {
  const [showScooterDropdown, setShowScooterDropdown] = useState(false);
  const [showBikeDropdown, setShowBikeDropdown] = useState(false);
  const [scooters, setScooters] = useState(computeScooters());

  useEffect(() => {
    syncLiveProducts().then(() => setScooters(computeScooters()));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#3a3a3a' }}>
      <Header />

      <div style={{ backgroundColor: '#000', paddingTop: '64px' }}>
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
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          marginLeft: '220px',
          marginTop: '-40px',
          position: 'relative',
          zIndex: 10,
          minHeight: '600px',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: '2px solid #e0e0e0',
            minHeight: '80px',
          }}
        >
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
              OVER 125CC
            </h1>
            <nav style={{ marginTop: '5px', fontSize: '11px', color: '#aaa', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }} className="hover:text-[#e31e24] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/products" style={{ color: '#aaa', textDecoration: 'none' }} className="hover:text-[#e31e24] transition-colors">Product</Link>
              <span>/</span>
              <span style={{ color: '#555' }}>SCOOTER</span>
              <span>/</span>
              <span style={{ color: '#555' }}>Over 125cc</span>
            </nav>
          </div>

          <div
            style={{
              flex: '1',
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowScooterDropdown(true)}
              onMouseLeave={() => setShowScooterDropdown(false)}
            >
              <div
                style={{
                  position: 'relative',
                  padding: '0 44px',
                  fontSize: '13px',
                  fontWeight: '700',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRight: '1px solid #e0e0e0',
                  background: '#fff',
                  color: '#222',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  height: '100%',
                }}
              >
                SCOOTER
                <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
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
              </div>

              {showScooterDropdown && (
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
            </div>

            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowBikeDropdown(true)}
              onMouseLeave={() => setShowBikeDropdown(false)}
            >
              <Link
                href="/products/bike/all"
                style={{
                  position: 'relative',
                  padding: '0 44px',
                  fontSize: '13px',
                  fontWeight: '700',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRight: '1px solid #e0e0e0',
                  background: '#f5f5f5',
                  color: '#888',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  height: '100%',
                  textDecoration: 'none',
                }}
              >
                BIKE
                <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
              </Link>

              {showBikeDropdown && (
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
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            borderTop: '1px solid #e5e5e5',
            paddingTop: '40px',
          }}
        >
          {scooters.length > 0 ? (
            scooters.map((product, i) => (
              <div
                key={product.id}
                style={{
                  position: 'relative',
                  borderRight: (i + 1) % 3 !== 0 ? '1px solid #e5e5e5' : 'none',
                  borderBottom: Math.floor(i / 3) < Math.floor((scooters.length - 1) / 3) ? '1px solid #e5e5e5' : 'none',
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
            ))
          ) : (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '80px 20px',
                color: '#666',
              }}
            >
              <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#999' }}>
                لا توجد منتجات في هذه الفئة حالياً
              </h3>
              <p style={{ fontSize: '16px', color: '#aaa' }}>
                سيتم إضافة منتجات جديدة قريباً
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: '60px' }} />

      {/* SimpleFooter */}
      <SimpleFooter />
    </div>
  );
}
