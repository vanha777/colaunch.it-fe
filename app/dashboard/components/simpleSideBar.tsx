import { useRouter } from 'next/navigation';
import React from 'react';
import Logo from '../../../public/apple.png';
import { UserData } from '@/app/utils/AppContext';
import { AppProvider, useAppContext } from "@/app/utils/AppContext";
interface SimpleSideBarProps {
    children: React.ReactNode;
}

const SimpleSideBar: React.FC<SimpleSideBarProps> = ({
    children,
}) => {
    const router = useRouter();
    const { auth, getUser } = useAppContext();
    return (
        <div className="bg-gray-50 drawer lg:drawer-open">
            <input id="sidebar" type="checkbox" className="drawer-toggle" />

            {/* Drawer content */}
            <div className="drawer-content flex flex-col">
                <label htmlFor="sidebar" className="btn btn-square btn-ghost drawer-button lg:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </label>
                <div className="p-4">
                    {children}
                </div>
            </div>

            {/* Sidebar Content */}
            <div className="drawer-side">
                <label htmlFor="sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 w-48 min-h-full bg-gray-50 text-base-content flex flex-col items-center gap-4">
                    <li className="mb-4">
                        <div data-tip="Go to Dashboard">
                            <div 
                                onClick={() => router.push('/dashboard')}
                                className="rounded-full bg-base-200 p-2 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center cursor-pointer"
                            >
                                <img
                                    src={Logo.src}
                                    alt="CoLaunch Logo"
                                    className="w-24 h-24 rounded-full"
                                    onError={(e) => { e.currentTarget.src = '/path/to/default/logo.png'; }}
                                />
                            </div>
                        </div>
                    </li>
                    <li className="mt-32">
                        <div
                            onClick={() => router.push(`/profile/${auth.userData?.id}/ideas`)}
                            className="rounded-full bg-base-200 p-4 shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                    </li>
                    <li className="flex justify-center">
                        <div
                            onClick={() => router.push(`/profile/${auth.userData?.id}/offers`)}
                            className="rounded-full bg-base-200 p-4 shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </li>
                    <li className="flex justify-center">
                        <div
                            onClick={() => router.push(`/profile/${auth.userData?.id}/deals`)}
                            className="rounded-full bg-base-200 p-4 shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SimpleSideBar;
