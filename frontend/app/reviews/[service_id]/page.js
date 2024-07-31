import ViewReviews from '../_components/ViewReviews';

export default async function ReviewsPage({ params }) {
  const { service_id } = params; // Extract service_id from params

  return (
    <div>
      <ViewReviews service_id={service_id} />
    </div>
  );
}
