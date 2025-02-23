'use client'
import { AppProvider, useAppContext, UserData } from "@/app/utils/AppContext";
import { useState } from "react";

const SimpleNavBar = () => {
    const { auth, logout } = useAppContext();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.error("Error loading image");
    };

    return (
        <div className="navbar bg-white shadow-sm">
            <div className="w-full px-6 py-3">
                <div className="flex justify-between items-center w-full">
                    {/* Logo */}
                    <div className="flex-1">
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                            CoLaunch.it
                        </div>
                    </div>

                    {/* User Profile with dropdown */}
                    <div className="relative">
                        <div 
                            className="flex items-center gap-3 ml-auto cursor-pointer" 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="text-gray-700">{auth.userData?.name}</span>
                            <div className="avatar">
                                <div className="w-9 h-9 rounded-full overflow-hidden">
                                    {auth.userData?.photo ? (
                                        <img
                                            src={auth.userData.photo}
                                            alt={auth.userData?.name || 'User avatar'}
                                            className="w-full h-full object-cover rounded-full"
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                            onError={handleImageError}
                                        />
                                    ) : (
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white w-full h-full flex items-center justify-center">
                                            <span>U</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                <button
                                    onClick={logout}
                                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleNavBar;
