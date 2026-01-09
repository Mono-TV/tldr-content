import { ContentDetail } from '@/components/content/content-detail';

// For static export, we need to provide all params at build time
// This fetches all content IDs from the API to pre-render all pages
export async function generateStaticParams() {
  try {
    console.log('Fetching all content for static generation...');

    // Fetch first page to get total pages
    const response = await fetch(
      'https://content-api-401132033262.asia-south1.run.app/api/content?limit=100&page=1'
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const totalPages = data.pagination?.pages || 1;
    let allContent = data.content || [];

    console.log(`Found ${totalPages} pages of content. Fetching all pages...`);

    // Paginate through all remaining pages
    for (let page = 2; page <= totalPages; page++) {
      console.log(`Fetching page ${page}/${totalPages}...`);
      const pageResponse = await fetch(
        `https://content-api-401132033262.asia-south1.run.app/api/content?limit=100&page=${page}`
      );

      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        allContent = [...allContent, ...(pageData.content || [])];
      }
    }

    console.log(`Successfully fetched ${allContent.length} content items for static generation`);

    // Map to static params
    return allContent.map((item: any) => ({
      id: item.imdb_id,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    console.log('Falling back to basic IDs to prevent build failure');

    // Fallback to basic IDs to prevent build failure
    return [
      { id: 'tt0111161' }, // Shawshank Redemption
      { id: 'tt0068646' }, // The Godfather
      { id: 'tt0468569' }, // The Dark Knight
    ];
  }
}

interface ContentPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { id } = await params;
  return <ContentDetail id={id} />;
}
