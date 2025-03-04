"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    IoGameControllerOutline,
    IoGameControllerSharp,
    IoStatsChartOutline,
    IoStatsChartSharp,
    IoImagesOutline,
    IoImagesSharp,
    IoSettingsOutline,
    IoSettingsSharp,
    IoCodeSlashOutline,
    IoCodeSlashSharp,
    IoStorefrontOutline,
    IoStorefrontSharp
} from "react-icons/io5";
import { MdGeneratingTokens, MdOutlineGeneratingTokens, MdOutlineWebhook, MdWebhook } from "react-icons/md";
import { CollectionData, GameData } from '@/app/utils/AppContext'
import { AppProvider, useAppContext } from "@/app/utils/AppContext";
import { Db } from "@/app/utils/db";
import SimpleLoading from "./simpleLoading";
import Navbar from "./navBarV2";
import IdeaComponent, { Idea } from "./ideaComponent";
import SimpleNav from "./simpleNav";
import SimpleSideBar from "./simpleSideBar";
import SimpleNavBar from "./simpleNavBar";
import ChatInstruction from "./chatInstruction";

export default function MainUniverse() {
    const { auth, setTokenData, setAccessToken, setCollectionData, setUser, setGame, logout } = useAppContext();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [activeMenu, setActiveMenu] = useState("software");
    const [activeView, setActiveView] = useState("view1");
    const [selectedGameData, setSelectedGameData] = useState<GameData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log("this is auth", auth);
        if (auth.userData == null) {
            window.location.href = '/dashboard/login';
        }
        const fetchIdeas = async () => {
            const { data: ideasData, error: ideasError } = await Db
                .from('ideas')
                .select(`
                    *,
                    address_detail!inner (*)
                  `).order('upvotes', { ascending: false }); // Sorting by upvotes descending
            console.log("ideasData", ideasData);
            const ideas = ideasData as Idea[];
            setIdeas(ideas);
        }
        fetchIdeas();
        // fetch token data for selected game
    }, [auth.userData]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2,
            },
        },
    };

    const industries = [
        {
            id: "software",
            label: "Software",
            icon: IoCodeSlashOutline,
            selectedIcon: IoCodeSlashSharp
        },
        {
            id: "healthcare",
            label: "Healthcare",
            icon: MdOutlineGeneratingTokens,
            selectedIcon: MdGeneratingTokens
        },
        {
            id: "fintech",
            label: "Fintech",
            icon: IoStorefrontOutline,
            selectedIcon: IoImagesSharp
        },
        {
            id: "ecommerce",
            label: "E-Commerce",
            icon: IoStorefrontOutline,
            selectedIcon: IoStorefrontSharp
        },
        {
            id: "ai",
            label: "AI & ML",
            icon: IoStatsChartOutline,
            selectedIcon: IoStatsChartSharp
        },
        {
            id: "sustainability",
            label: "Green Tech",
            icon: IoSettingsOutline,
            selectedIcon: IoSettingsSharp
        }
    ];

    return (
        <>
            {isLoading ? (
                <SimpleLoading />
            ) : (
                <>
                    <SimpleSideBar>
                        <IdeaComponent ideas={ideas} industries={industries} />
                    </SimpleSideBar>
                </>
            )}
        </>
    );
}
