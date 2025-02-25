'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Db, Server } from "@/app/utils/db";
import { AppProvider, useAppContext, UserData } from "@/app/utils/AppContext";
import { redirect } from 'next/navigation';
import ManageIdeaForm from '@/app/dashboard/components/manageIdeas';
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
}

export interface IdeaProps {
  id?: number;
  title: string;
  description: string;
  date?: string;
  address_detail?: LocationProps;
  industry?: string;
  media?: string[];
  upvotes?: number;
  downvotes?: number;
  url?: string;
  offer?: OfferProps;
}

export default function IdeaCard() {
  const { auth, getUser } = useAppContext();
  const [parsedIdeas, setParsedIdeas] = useState<IdeaProps[]>([]);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<IdeaProps | undefined>(undefined);

  useEffect(() => {
    const fetchIdeas = async () => {
      let user = auth.userData;
      if (!user) {
        user = getUser();
        console.log("welcome back", user);
      }

      // Fetch all ideas from supabase with related data
      const { data: ideasData, error: ideasError } = await Db
        .from('ideas')
        .select(`*,address_detail!inner (*)`)
        .eq('user_id', user?.id);

      if (!ideasData || ideasData.length === 0) {
        console.log("ideasData not found");
        redirect('/not-found');
      }

      // Fetch offers for all ideas
      const parsedIdeasData = await Promise.all(ideasData.map(async (ideaData) => {
        let parsedIdeaData = JSON.parse(JSON.stringify(ideaData)) as IdeaProps;

        const { data: offersData, error: offerError } = await Db
          .from('offers')
          .select(`*`)
          .eq('idea_id', parsedIdeaData.id)
          .limit(1).single();

        if (offersData) {
          parsedIdeaData.offer = JSON.parse(JSON.stringify(offersData)) as OfferProps;
        }
        return parsedIdeaData;
      }));

      console.log("parsedIdeas", parsedIdeasData);
      setParsedIdeas(parsedIdeasData);
    }
    fetchIdeas();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Ideas
        </h1>
        <p className="text-gray-600">Manage and view all your business ideas</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
        {/* Existing Idea Cards */}
        {parsedIdeas.map((idea) => (
          <div
            key={idea.id}
            className="card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedIdea(idea);
              setShowIdeaForm(true);
            }}
          >
            {/* Image Section */}
            {idea.media && idea.media.length > 0 && (
              <div className="relative h-48">
                <img
                  src={idea.media[0]}
                  alt={idea.title}
                  className="w-full h-full object-cover rounded-t-xl"
                />
              </div>
            )}

            {/* Content Section */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{idea.title}</h2>

              {/* Location and Industry Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {idea.address_detail && (
                  <span className="inline-flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    📍 {idea.address_detail.country}
                    {idea.address_detail.state ? `, ${idea.address_detail.state}` : ''}
                  </span>
                )}
                {idea.industry && (
                  <span className="inline-flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    🏢 {idea.industry}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-2">{idea.description}</p>

              {/* Footer */}
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <span className="text-sm text-gray-500">⬆️ {idea.upvotes || 0}</span>
                  <span className="text-sm text-gray-500">⬇️ {idea.downvotes || 0}</span>
                </div>
                {idea.offer && (
                  <span className={`px-3 py-1 rounded-full text-sm ${idea.offer.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {idea.offer.active ? 'Active Deal' : 'Inactive Deal'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {/* Add New Idea Card */}
        <div
          onClick={() => setShowIdeaForm(true)}
          className="card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 border-dashed cursor-pointer flex items-center justify-center min-h-[300px]"
        >
          <div className="text-center">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600">Create New Idea</h3>
          </div>
        </div>
      </div>

      {/* Form Overlay */}
      {showIdeaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <ManageIdeaForm
              setShowCreateForm={(show) => {
                setShowIdeaForm(show);
                if (!show) {
                  setSelectedIdea(undefined);
                }
              }}
              selectedIdea={selectedIdea}
            />
          </div>
        </div>
      )}
    </div>
  );
}