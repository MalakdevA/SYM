import { RedirectClient } from './RedirectClient';

// Required by Next.js output: export — dynamic routes must declare params
export function generateStaticParams() {
  return [{ orderNo: 'fallback' }];
}

interface OrderSuccessDynamicPageProps {
  params: Promise<{
    orderNo: string;
  }>;
}

/**
 * Redirect /order-success/[orderNo] → /order-success?orderNo=[orderNo]
 * so the static export-compatible page (app/order-success/page.tsx) handles rendering.
 */
export default async function OrderSuccessRedirectPage({ params }: OrderSuccessDynamicPageProps) {
  const { orderNo } = await params;
  return <RedirectClient orderNo={orderNo} />;
}

