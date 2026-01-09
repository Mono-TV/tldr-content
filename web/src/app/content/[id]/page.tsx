import { ContentDetail } from '@/components/content/content-detail';

// For ISR: Pre-render top 100 pages at build time, generate others on-demand
export async function generateStaticParams() {
  try {
    console.log('Fetching top content for ISR pre-rendering...');

    // Fetch only first page (top 100 items) for build-time generation
    const response = await fetch(
      'https://content-api-401132033262.asia-south1.run.app/api/content?limit=100&page=1',
      { next: { revalidate: 3600 } } // Revalidate every hour
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.items || [];

    console.log(`Pre-rendering ${content.length} top content pages at build time`);

    // Map to static params (only top 100)
    return content.map((item: any) => ({
      id: item.imdb_id,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    console.log('Falling back to basic IDs');

    // Fallback to basic IDs
    return [
      { id: 'tt0111161' }, // Shawshank Redemption
      { id: 'tt0068646' }, // The Godfather
      { id: 'tt0468569' }, // The Dark Knight
    ];
  }
}

// Enable ISR with dynamic rendering for non-pre-rendered pages
export const dynamicParams = true;
export const revalidate = 3600; // Revalidate pages every hour

interface ContentPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { id } = await params;
  return <ContentDetail id={id} />;
}
