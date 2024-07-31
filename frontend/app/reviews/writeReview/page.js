"use client";
import { useSearchParams } from 'next/navigation';
import WriteReview from '../_components/WriteReview';

export default function WriteReviewPage() {
  const searchParams = useSearchParams();
  const service_id = searchParams.get('service_id');
  const provider_id = searchParams.get('provider_id');

  if (!service_id || !provider_id) return <p>Error: Missing service_id or provider_id.</p>;

  return (
    <div>
      <WriteReview service_id={service_id} provider_id={provider_id} />
    </div>
  );
}
