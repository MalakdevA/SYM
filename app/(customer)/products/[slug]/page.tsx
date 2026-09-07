import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
import { ScooterDetailView } from '@/components/scooters/ScooterDetailView';
import { getProductBySlug, PRODUCTS } from '@/lib/data/products';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Scooter Not Found - SYM Egypt',
    };
  }

  return {
    title: `${product.name} — المواصفات والسعر في مصر`,
    description: product.description,
  };
}

export function generateStaticParams() {
  const params: Array<{ slug: string }> = [];
  PRODUCTS.forEach((product) => {
    params.push({ slug: product.slug });
    if (product.id && product.id !== product.slug) {
      params.push({ slug: product.id });
    }
    if (product.slug.includes('xwolf') || product.slug.includes('x-wolf')) {
      params.push({ slug: 'xwolf-300' });
      params.push({ slug: 'xwolf' });
      params.push({ slug: 'x-wolf' });
    }
    if (product.slug.includes('nht') || product.slug.includes('nh-t')) {
      params.push({ slug: 'nht' });
      params.push({ slug: 'nh-t' });
      params.push({ slug: 'nht-200' });
      params.push({ slug: 'nht200' });
    }
  });
  return params;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1c1c1e] text-white select-none">
      <Header />
      <main className="flex-1 pt-0">
        <ScooterDetailView product={product} allProducts={PRODUCTS} />
      </main>
      <Footer />
    </div>
  );
}
