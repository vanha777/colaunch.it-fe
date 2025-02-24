'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Db, Server } from "@/app/utils/db";
import { AppProvider, useAppContext, UserData } from "@/app/utils/AppContext";
import ManageIdeaForm from '@/app/dashboard/components/manageIdeas';
import { IdeaProps } from '../../components/ideaCard';
import ManageOfferForm from './manageOffers';
import { useRouter } from 'next/navigation';
export interface LocationProps {
  id?: number;
  country?: string;
  state?: string;
  suburb?: string;
}

export interface OfferProps {
  id?: number;
  created_at?: string;
  totalDeals?: number;
  active?: boolean;
  comission?: number;
  type?: string;
  description?: string;
  ideas?: IdeaProps;
}

export default function OfferCard() {
  const router = useRouter();
  const { auth, getUser } = useAppContext();
  const [parsedOffers, setParsedOffers] = useState<OfferProps[]>([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferProps | undefined>(undefined);

  useEffect(() => {
    const fetchIdeas = async () => {
      let user = auth.userData;
      if (!user) {
        user = getUser();
        console.log("welcome back", user);
      }
      // Update the query to include ideas
      const { data: offersData, error: offersError } = await Db
        .from('offers')
        .select(`
          *,
        ideas!idea_id (
          *
          )
        `)
        .eq('user_id', user?.id);

      if (!offersData || offersData.length === 0) {
        console.log("offersData not found");
        // router.push('/not-found');
      }
      console.log("parsedOffers", offersData);
      setParsedOffers(offersData as OfferProps[]);
    }
    fetchIdeas();
  }, []);

  return (
    <div className="w-full px-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
        {parsedOffers && parsedOffers.length > 0 && parsedOffers.map((offer) => (
          <div
            key={offer.id}
            className="card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedOffer(offer);
              setShowOfferForm(true);
            }}
          >
            {/* Card Header with Image */}
            <figure className="relative">
              {offer.ideas && offer.ideas.media && offer.ideas.media[0] && (
                <Image
                  src={offer.ideas.media[0]}
                  alt={offer.ideas.title || 'Idea image'}
                  width={400}
                  height={300}
                  className="w-full h-52 object-cover"
                />
              )}
            </figure>

            {/* Card Body */}
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">
                  {offer.ideas?.title || 'Offer Information'}
                </h2>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  offer.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {offer.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Commission and Type */}
              <div className="flex gap-3">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm">
                  {offer.comission}% Commission
                </span>
                {offer.type && (
                  <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-md text-sm">
                    {offer.type}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm line-clamp-2">
                {offer.description}
              </p>

              {/* Metadata Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>🤝 {offer.totalDeals || 0} deals</span>
                <span>📅 {offer.created_at}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Offer Card */}
        <div
          onClick={() => setShowOfferForm(true)}
          className="card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-gray-200 cursor-pointer h-[400px] flex items-center justify-center"
        >
          <div className="text-center p-6">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600">Create New Offer</h3>
            <p className="text-sm text-gray-500 mt-2">Click to add a new offer</p>
          </div>
        </div>
      </div>

      {/* Form Overlay */}
      {showOfferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <ManageOfferForm
              setShowOfferForm={(show) => {
                setShowOfferForm(show);
                if (!show) {
                  setSelectedOffer(undefined);
                }
              }}
              selectedOffer={selectedOffer}
            />
          </div>
        </div>
      )}
    </div>
  );
}