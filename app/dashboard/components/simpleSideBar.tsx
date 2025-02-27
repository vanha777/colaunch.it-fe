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
                    <li className="flex justify-center">
                        <div
                            onClick={() => router.push(`/profile/${auth.userData?.id}/partners`)}
                            className="rounded-full bg-base-200 p-4 shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer"
                        >
                            <svg fill="#000000" className="h-10 w-10" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 207.586 207.586" stroke="#000000" stroke-width="6.227580000000001"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M204.539,80.265l-63.92-63.92c-4.051-4.055-10.654-4.048-14.716,0.014l-9.838,9.837c-1.973,1.975-3.061,4.591-3.061,7.37 c-0.002,2.772,1.081,5.381,3.047,7.346l2.879,2.879c-3.473,1.371-8.345,3.524-13.851,6.588 c-5.695-4.339-10.328-7.778-13.208-9.893c3.663-4.075,3.565-10.361-0.363-14.289l-9.838-9.84 c-4.066-4.055-10.667-4.059-14.715-0.011l-63.92,63.92C-1.018,84.317-1.011,90.92,3.05,94.982l9.838,9.84 c2.034,2.029,4.703,3.047,7.372,3.047c2.479,0,4.938-0.916,6.901-2.676c2.288,3.148,6.044,8.257,10.514,14.138l-10.052,10.05 c-0.651,0.651-1.018,1.534-1.018,2.457c0,0.923,0.367,1.805,1.018,2.457l12.286,12.286l-0.001,0.001l4.913,4.913l0.001-0.001 l7.371,7.371l4.913,4.913l9.829,9.829l-0.001,0.001l4.915,4.913l14.74,14.74c0.679,0.679,1.568,1.018,2.457,1.018 s1.778-0.339,2.457-1.018l10.742-10.74c6.532,4.877,11.295,8.287,11.809,8.653c0.607,0.434,1.315,0.648,2.017,0.648 c0.896,0,1.787-0.346,2.458-1.018l46.676-46.676c0.001-0.001,0.003-0.002,0.005-0.003c0.002-0.002,0.002-0.003,0.003-0.005 l12.282-12.282c1.201-1.201,1.357-3.094,0.371-4.476c-0.391-0.548-4.228-5.904-9.618-13.095l7.033-14.126l4.69,4.69 c2.024,2.026,4.684,3.037,7.346,3.037c2.667,0,5.337-1.018,7.37-3.05l9.838-9.837c1.973-1.975,3.061-4.591,3.061-7.37 C207.588,84.839,206.506,82.23,204.539,80.265z M22.687,99.919c-1.36,1.37-3.51,1.36-4.887-0.014l-9.837-9.837 c-1.352-1.354-1.359-3.546-0.015-4.889l63.92-63.92c0,0,0,0,0.002,0c0.679-0.682,1.554-1.021,2.429-1.021 c0.882,0,1.768,0.346,2.458,1.035l9.837,9.837c1.352,1.354,1.359,3.546,0.015,4.889L22.687,99.919z M34.993,131.838l6.949-6.947 c2.807,3.619,5.755,7.337,8.709,10.946l-5.829,5.83L34.993,131.838z M57.105,153.951l-7.371-7.372l5.381-5.382 c2.408,2.827,4.747,5.459,6.949,7.795L57.105,153.951z M71.847,168.691l-9.827-9.827l4.959-4.959 c3.055,2.881,6.64,6.006,10.461,9.191L71.847,168.691z M89.045,185.89l-12.284-12.284l6.08-6.083 c4.671,3.762,9.426,7.45,13.799,10.773L89.045,185.89z M170.489,129.015l-7.738,7.737l-31.938-31.941 c-1.357-1.357-3.556-1.357-4.913,0s-1.357,3.556,0,4.913l31.938,31.941l-9.827,9.827l-31.939-31.939 c-1.357-1.357-3.556-1.357-4.913,0c-1.357,1.357-1.357,3.556,0,4.913l31.939,31.939l-9.827,9.827l-31.94-31.94 c-1.357-1.357-3.556-1.357-4.913,0s-1.357,3.556,0,4.913l31.94,31.94l-12.65,12.65c-8.02-5.823-34.171-25.072-46.316-37.216 c-6.94-6.942-16.197-18.454-23.949-28.547c-0.164-0.332-0.345-0.659-0.621-0.935c-0.057-0.057-0.132-0.075-0.191-0.127 c-5.454-7.127-10.081-13.434-12.458-16.706l54.772-54.775c2.413,1.767,6.537,4.815,11.714,8.738 c-5.524,3.558-11.313,7.95-16.7,13.338c-8.317,8.313-13.805,14.394-16.779,18.584c-1.462,2.06-4.885,6.885-1.615,10.149 c0.763,0.763,2.185,2.185,15.744,3.461c0.108,0.01,0.217,0.014,0.326,0.014c0.509,0,1.015-0.112,1.478-0.329 c7.227-3.393,20.605-8.537,25.625-7.984c7.971,0.895,19.772-5.713,26.161-9.317c0.125,0.187,0.206,0.394,0.371,0.559 C145.411,94.843,164.665,120.997,170.489,129.015z M163.566,108.084c-8.019-10.483-17.874-22.787-25.383-30.296 c-0.434-0.434-0.964-0.678-1.515-0.835c-0.068-0.239-0.093-0.485-0.216-0.713c-0.909-1.69-3.017-2.324-4.706-1.415 c-0.572,0.309-1.308,0.723-2.173,1.211c-4.864,2.752-16.255,9.165-22.043,8.52c-7.928-0.913-24.186,6.219-28.497,8.191 c-3.252-0.333-6.847-0.818-9.099-1.262c1.464-2.368,5.561-7.631,16.939-19.008c14.104-14.104,31.676-21.212,37.457-23.289 l45.771,45.771L163.566,108.084z M199.611,90.068l-9.837,9.837c-1.354,1.354-3.546,1.354-4.889,0.014l-56.877-56.877 c-0.066-0.083-0.146-0.142-0.218-0.218l-6.825-6.825c-0.653-0.651-1.011-1.517-1.011-2.433c0-0.923,0.365-1.795,1.026-2.457 l9.837-9.837c0.679-0.679,1.569-1.018,2.457-1.018c0.882,0,1.763,0.336,2.433,1.004l63.92,63.92 c0.653,0.651,1.011,1.517,1.011,2.433C200.637,88.534,200.273,89.406,199.611,90.068z"></path> </g> </g> </g></svg>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SimpleSideBar;
