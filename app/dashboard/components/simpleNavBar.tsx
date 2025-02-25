"use client";

import { useCallback, useState } from 'react';
import { Settings, RefreshCw, Server, Share2, Settings2, Shapes } from 'lucide-react';
import Logo from '../../../public/apple.png';
import { useRouter } from 'next/navigation';
import { AppProvider, GameData, useAppContext } from "@/app/utils/AppContext";

export default function Navbar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { auth, getUser, logout } = useAppContext();
  console.log("user photo", auth.userData?.photo);
  
  const handleSignOut = () => {
    logout();
  };

  return (
    <div className="navbar bg-gray-50 text-black p-4 sticky top-0 z-50">
      {/* Left side - with bubble style */}
      <div className="flex-1">
        {auth.userData?.email && (
          <div 
            onClick={() => router.push('/profile/1/settings')}
            className="bg-base-200 rounded-full px-6 py-2 shadow-lg flex items-center cursor-pointer hover:shadow-xl transition-shadow duration-300"
          >
            {/* User Photo */}
            <div className="w-10 h-10 rounded-full overflow-hidden mr-4 ring-2 ring-purple-600">
              <img
                src={auth.userData?.photo || Logo.src}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = Logo.src }}
              />
            </div>

            {/* Username */}
            <div className="text-lg font-semibold mr-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold">
                {auth.userData?.name}
              </span>
            </div>

            {/* Integration Partner */}
            {/* <div className="dropdown dropdown-end">
              <div className="tooltip tooltip-bottom" data-tip={`Current Integration: ${integrationPartner?.integration_partner || 'None'}`}>
                <label tabIndex={0} className="btn btn-ghost btn-circle">
                  <Server className="h-6 w-6" />
                </label>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <a className={`tooltip tooltip-right flex items-center gap-2 ${integrationPartner?.integration_partner === 'emis' ? 'bg-[#14F195]/20' : ''}`} data-tip="Connect to EMIS Clinical System" onClick={() => setIntegrationPartner({ integration_partner: 'emis' })}>
                    EMIS
                  </a>
                </li>
                <li>
                    <a className={`tooltip tooltip-right flex items-center gap-2 ${integrationPartner?.integration_partner === 'rxweb' ? 'bg-[#14F195]/20' : ''}`} data-tip="Connect to RxWeb Pharmacy System" onClick={() => setIntegrationPartner({ integration_partner: 'rxweb' })}>
                      RxWeb
                    </a>
                </li>
                
                <li>
                  <a className={`tooltip tooltip-right flex items-center gap-2 ${integrationPartner?.integration_partner === 'titan' ? 'bg-[#14F195]/20' : ''}`} data-tip="Connect to Titan System" onClick={() => setIntegrationPartner({ integration_partner: 'titan' })}>
                    Titan
                  </a>
                </li>
                <li>
                  <a className={`tooltip tooltip-right flex items-center gap-2 ${integrationPartner?.integration_partner === 'pharma_outcomes' ? 'bg-[#14F195]/20' : ''}`} data-tip="Connect to PharmOutcomes Platform" onClick={() => setIntegrationPartner({ integration_partner: 'pharma_outcomes' })}>
                    Pharma Outcomes
                  </a>
                </li>
              </ul>
            </div> */}
          </div>
        )}
      </div>

      {/* Right side - with bubble style */}
      <div className="flex-none">
        <div className="bg-base-200 rounded-full px-6 py-2 shadow-lg flex items-center gap-2">
          {/* <SettingsPage>
            <button className="btn btn-ghost">Settings</button>
          </SettingsPage> */}

          {auth.userData?.email && (
            <button
              className="btn btn-ghost hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

