import { Suspense } from 'react'
import BookingPage from '../component/booking'

export default function Page({ params }: { params: { id: string } }) {
  const businessId = params.id

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
      <Suspense fallback={<div className="p-8 text-center">Loading booking details...</div>}>
        <BookingPage businessId={businessId} />
      </Suspense>
    </div>
  )
}

