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
    <div className="w-full">
      {/* Page Heading with navbar-style bubble */}
      <div className="navbar bg-gray-50 text-black p-6">
        <div className="flex-1">
          <div className="bg-base-200 rounded-full px-8 py-4 shadow-lg flex items-center">
            <div className="text-xl">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold text-2xl">
                My Offers
              </span>
              <p className="text-base text-gray-600 mt-2">Manage and view all your business offers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
        {parsedOffers && parsedOffers.length > 0 && parsedOffers.map((offer) => (
          <div
            key={offer.id}
            className="card bg-base-200 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
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
            <div className="card-body p-5">
              <div className="flex justify-between items-start">
                <h2 className="card-title text-gray-800 font-semibold">
                  {offer.ideas?.title || 'Offer Information'}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  offer.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {offer.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {/* Commission and Type */}
                <div className="flex flex-wrap gap-2">
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
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    {offer.totalDeals || 0} deals
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(offer.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Offer Card */}
        <div
          onClick={() => setShowOfferForm(true)}
          className="card bg-base-200 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-dashed border-2 border-gray-300 cursor-pointer flex items-center justify-center min-h-[300px]"
        >
          <div className="text-center p-6">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600">Create New Offer</h3>
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