'use client'
import { AppProvider, useAppContext, UserData } from "@/app/utils/AppContext";
const SimpleNavBar = () => {
    const { auth } = useAppContext();

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.error("Error loading image");
    };

    return (
        <div className="navbar bg-white shadow-sm">
            <div className="w-full px-6 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex-none">
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                            CoLaunch.it
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex-none flex items-center gap-3">
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
                </div>
            </div>
        </div>
    );
};

export default SimpleNavBar;
