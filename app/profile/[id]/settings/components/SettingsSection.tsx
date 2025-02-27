import { IoSettingsSharp } from "react-icons/io5";
import { FaCrown, FaRegCreditCard, FaTwitter, FaGithub, FaLinkedin, FaGlobe, FaInstagram } from "react-icons/fa";
import Alert from "@/components/Alert";
import { GameData, useAppContext, UserData } from "@/app/utils/AppContext";
import { useEffect, useState } from "react";
import { Db } from "@/app/utils/db";

// Add social media interface
interface SocialMedia {
  platform: 'twitter' | 'github' | 'linkedin' | 'website' | 'instagram';
  url: string;
}

export default function SettingsSection({ user_id }: { user_id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { auth, getUser } = useAppContext();
  const [userInfo, setUserInfo] = useState<UserData | null>(null);

  useEffect(() => {
    console.log("Re-render SettingsSection");
    const user = getUser();
    if (user?.email) {
      setUserInfo(user);
    } else {
      const fetchUser = async () => {
        const { data: userData, error: userError } = await Db
          .from("users")
          .select("*")
          .eq("id", user_id)
          .single();
        const parsedUser = userData as UserData;
        if (userError) {
          console.error("Error fetching user data:", userError);
        } else {
          setUserInfo(parsedUser);
        }
      };
      fetchUser();
    }
  }, [auth.userData]);

  // Add social media configuration
  const socialIcons = {
    twitter: { icon: FaTwitter, color: 'text-[#1DA1F2] bg-blue-50', link: auth.userData?.x },
    github: { icon: FaGithub, color: 'text-gray-900 bg-gray-50', link: auth.userData?.github },
    linkedin: { icon: FaLinkedin, color: 'text-[#0A66C2] bg-blue-50', link: auth.userData?.linkedin },
    website: { icon: FaGlobe, color: 'text-emerald-600 bg-emerald-50', link: auth.userData?.website },
    instagram: { icon: FaInstagram, color: 'text-[#E4405F] bg-pink-50', link: auth.userData?.instagram }
  };

  const [currentPlan, setCurrentPlan] = useState('free');
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: ['Basic Analytics', 'Limited Transactions', 'Community Support'],
      id: 'free'
    },
    {
      name: 'Pro',
      price: '$29/month',
      features: ['Advanced Analytics', 'Unlimited Transactions', 'Priority Support', 'Custom Branding'],
      id: 'pro'
    }
  ];

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan) {
      setAlert({
        show: true,
        message: 'You are already subscribed to this plan',
        type: 'info'
      });
      return;
    }

    setAlert({
      show: true,
      message: 'Subscription updated successfully!',
      type: 'success'
    });
    setCurrentPlan(planId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative p-8">
      {/* Header Section with Bubble Style */}
      <div className="navbar bg-gray-50 text-black p-6 mb-8">
        <div className="flex-1">
          <div className="bg-base-200 rounded-full px-8 py-4 shadow-lg flex items-center gap-6">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-md">
              {userInfo?.photo ? (
                <img
                  src={userInfo.photo}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <IoSettingsSharp className="text-2xl text-white" />
                </div>
              )}
            </div>
            <div className="text-xl">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold text-2xl">
                {userInfo?.name}
              </span>
              <p className="text-base text-gray-600 mt-2">Account Settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* User Information Card */}
        <div className="bg-base-200 p-8 rounded-3xl shadow-sm">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-6">
            User Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userInfo && Object.entries(userInfo)
              .filter(([key]) => !['id', 'photo', 'referal', 'favourite_game', 'type', 'studio_name', 'social_media'].includes(key.toLowerCase()))
              .map(([key, value]) => (
                <div key={key} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                  <p className="text-gray-900 font-medium">{value}</p>
                </div>
              ))}
          </div>

          {/* Social Media Section */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-4">Social Media</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(socialIcons).map(([platform, { icon: Icon, color }]) => (
                <div key={platform} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="text-xl" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-sm">{platform.charAt(0).toUpperCase() + platform.slice(1)}</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Enter your ${platform} URL`}
                          className="w-full text-sm text-gray-900 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1"
                          value={userInfo?.social_media?.[platform as keyof typeof socialIcons]?.url || ''}
                          onChange={(e) => {
                            // Handle social media update
                            console.log(`Updating ${platform} URL:`, e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Plans Card */}
        {auth.userData?.email && (
          <div className="bg-base-200 p-8 rounded-3xl shadow-sm">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-6">
              Subscription Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.id}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.id === 'pro'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    <FaCrown className="text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                </div>

                <p className="text-3xl font-bold text-gray-900 mb-4">{plan.price}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-gray-600 flex items-center gap-2">
                      <span className="text-green-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-all duration-300
                    ${currentPlan === plan.id
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-md hover:shadow-blue-200'
                    }`}
                >
                  <FaRegCreditCard />
                  <span>{currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}</span>
                </button>
              </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Remove floating elements as they don't match the new style */}

      <Alert
        isOpen={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
} 