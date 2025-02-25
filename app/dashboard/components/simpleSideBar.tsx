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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                    </li>
                    <li className="flex justify-center">
                        <div
                            onClick={() => router.push(`/profile/${auth.userData?.id}/offers`)}
                            className="rounded-full bg-base-200 p-4 shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                    </li>
                    <li className="flex justify-center">
                        <div
                            onClick={() => router.push(`/profile/${auth.userData?.id}/deals`)}
                            className="rounded-full bg-base-200 p-4 shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer"
                        >
                            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M6 5V4C6 2.34315 7.34315 1 9 1H15C16.6569 1 18 2.34315 18 4V5H20C21.6569 5 23 6.34315 23 8V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V8C1 6.34315 2.34315 5 4 5H6ZM8 4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V5H8V4ZM19.882 7H4.11803L6.34164 11.4472C6.51103 11.786 6.8573 12 7.23607 12H11C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12H16.7639C17.1427 12 17.489 11.786 17.6584 11.4472L19.882 7ZM11 14H7.23607C6.09975 14 5.06096 13.358 4.55279 12.3416L3 9.23607V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V9.23607L19.4472 12.3416C18.939 13.358 17.9002 14 16.7639 14H13C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14Z" fill="#0F0F0F"></path> </g></svg>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SimpleSideBar;
