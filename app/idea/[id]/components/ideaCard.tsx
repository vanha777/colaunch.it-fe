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
  };
}

export default function IdeaCard({ idea }: { idea: IdeaProps }) {
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

        {/* Right Section */}
        <div className="w-1/3 p-4 border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Deal Information</h3>
          <div className="space-y-2">
            {idea.dealInfo?.createdDate && (
              <p className="text-sm">Created: {idea.dealInfo.createdDate}</p>
            )}
            {idea.dealInfo?.percentage && (
              <p className="text-sm">Success Rate: {idea.dealInfo.percentage}%</p>
            )}
            {idea.dealInfo?.totalDeals && (
              <p className="text-sm">Total Deals: {idea.dealInfo.totalDeals}</p>
            )}
          </div>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Make Deal
          </button>
        </div>
      </div>
    </div>
  );
}