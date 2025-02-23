'use client'
import { useState } from 'react';
import Image from 'next/image';

interface IdeaProps {
  title: string;
  description: string;
  date?: string;
  location?: string;
  industry?: string;
  images?: string[];
  upvotes?: number;
  downvotes?: number;
  dealInfo?: {
    createdDate?: string;
    percentage?: number;
    totalDeals?: number;
    active?: boolean;
    comission?: number;
    type?: string;
    description?: string;
  };
}

export default function IdeaCard({ idea }: { idea: IdeaProps }) {
  // const [idea, setIdea] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="w-full">
      {/* Carousel Section */}
      {idea.images && idea.images.length > 0 && (
        <div className="relative w-full h-64 mb-4">
          <img
            src={idea.images[currentImageIndex]}
            alt={`Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute bottom-4 right-4 space-x-2">
            {idea.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  currentImageIndex === index ? 'bg-white' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Split Content */}
      <div className="flex gap-4">
        {/* Left Section */}
        <div className="flex-1 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-bold">{idea.title}</h2>
          {idea.location && (
            <p className="text-sm text-gray-600">📍 {idea.location}</p>
          )}
          {idea.industry && (
            <p className="text-sm text-gray-600">🏢 {idea.industry}</p>
          )}
          <div className="flex gap-4 my-2">
            <button className="flex items-center gap-1">
              <span>⬆️</span>
              <span>{idea.upvotes || 0}</span>
            </button>
            <button className="flex items-center gap-1">
              <span>⬇️</span>
              <span>{idea.downvotes || 0}</span>
            </button>
          </div>
          <p className="mt-2">{idea.description}</p>
        </div>

        {/* Right Section - Redesigned */}
        <div className="w-1/3 flex flex-col p-0 border border-gray-200 rounded-2xl shadow-lg overflow-hidden bg-white">
          {/* Card Header with Metadata */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-xl font-bold text-gray-800">Deal Information</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {idea.dealInfo?.createdDate && (
                <span className="px-2 py-1 bg-white/80 rounded-full text-gray-600">
                  📅 {idea.dealInfo.createdDate}
                </span>
              )}
              {idea.dealInfo?.active !== undefined && (
                <span className={`px-2 py-1 rounded-full ${
                  idea.dealInfo.active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  ⭐ {idea.dealInfo.active ? 'Active' : 'Inactive'}
                </span>
              )}
              {idea.dealInfo?.type && (
                <span className="px-2 py-1 bg-white/80 rounded-full text-gray-600">
                  📋 {idea.dealInfo.type}
                </span>
              )}
              {idea.dealInfo?.totalDeals && (
                <span className="px-2 py-1 bg-white/80 rounded-full text-gray-600">
                  🤝 {idea.dealInfo.totalDeals} deals
                </span>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="flex-1 p-6 space-y-6">
            {/* Commission - Highlighted */}
            {idea.dealInfo?.comission && (
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {idea.dealInfo.comission}%
                </div>
                <div className="text-sm text-blue-600">Commission Rate</div>
              </div>
            )}

            {/* Description - Prominent */}
            {idea.dealInfo?.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Deal Details
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {idea.dealInfo.description}
                </p>
              </div>
            )}
          </div>

          {/* Card Action */}
          <div className="p-6 bg-gray-50">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-blue-200 hover:shadow-lg active:transform active:scale-98">
              Make Deal
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              By making a deal, you agree to our terms and conditions. Commission rates are subject to change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}