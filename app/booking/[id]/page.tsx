import { Suspense } from 'react'
import BookingPage from '../component/booking'

export default function Page({ params }: { params: { id: string } }) {
  const businessId = params.id

  return (
    <div className="container mx-auto bg-black">
      <Suspense fallback={<div className="p-8 text-center">Loading booking details...</div>}>
        <BookingPage businessId={businessId} />
      </Suspense>
    </div>
  )
}

