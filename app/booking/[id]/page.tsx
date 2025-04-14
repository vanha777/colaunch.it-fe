import { Suspense } from 'react'
import BookingPage from '../component/booking'

export default function Page({ 
  params,
  searchParams 
}: { 
  params: { id: string },
  searchParams: { booking_id?: string }
}) {
  const businessId = params.id
  const bookingId = searchParams.booking_id

  return (
    <div className="container mx-auto bg-black">
      <Suspense fallback={<div className="p-8 text-center">Loading booking details...</div>}>
        <BookingPage businessId={businessId} bookingId={bookingId} />
      </Suspense>
    </div>
  )
}

