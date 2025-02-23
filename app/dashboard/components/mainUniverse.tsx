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
export default function MainUniverse() {
    const { auth, setTokenData, setAccessToken, setCollectionData, setUser, setGame, logout } = useAppContext();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [activeMenu, setActiveMenu] = useState("software");
    const [activeView, setActiveView] = useState("view1");
    const [selectedGameData, setSelectedGameData] = useState<GameData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const selectGame = async (game: GameData) => {
        console.log("debug here 0");
        try {
            setIsLoading(true);
            // get access_token from server
            const response = await fetch('https://metaloot-cloud-d4ec.shuttle.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: game.id,
                    client_secret: "metalootfreetier"
                })
            });
            console.log("debug here 1");
            if (!response.ok) {
                // throw new Error('Failed to fetch access token');
                window.location.href = '/dashboard/login';
                return;
            }
            console.log("debug here 2");
            const data = await response.json();
            setAccessToken(data.access_token);
            console.log("get access_token successfully");

            // get game_data from server
            const response_game = await fetch(`https://metaloot-cloud-d4ec.shuttle.app/v1/api/game/${game.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${data.access_token}`
                }
            });
            if (!response.ok) {
                // throw new Error('Failed to fetch access token');
                window.location.href = '/dashboard/login';
                return;
            }
            console.log("debug here 3");
            const game_data = await response_game.json();
            console.log("get game data successfully", game_data);
            setSelectedGameData(game);

            // Fetch and parse URI data for each game
            const uri = game_data.account.data.token_uri;
            const tokenDataWithDetails = await fetch(uri);
            const uriData = await tokenDataWithDetails.json();
            console.log("tokenDataWithDetails", uriData);
            setTokenData({
                name: uriData.name,
                symbol: uriData.symbol,
                uri: uri,
                image: uriData.image,
                description: uriData.description,
                address: game_data.native_token,
            });
            console.log("debug here 4");

            // get collection_data from server
            const collection_uris: CollectionData[] = await Promise.all(game_data.account.data.nft_collection.map(async (collection: any) => {
                const uri = collection.uri;
                const collectionDataWithDetails = await fetch(uri);
                const collectionUriData = await collectionDataWithDetails.json();
                return {
                    name: collectionUriData.name,
                    symbol: collectionUriData.symbol,
                    size: collectionUriData.size || 0,
                    uri: uri,
                    description: collectionUriData.description,
                    address: collection.address,
                    image: collectionUriData.image,
                } as CollectionData;
            }));
            console.log("get collection data successfully");
            setCollectionData(collection_uris);

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching tokens:', error);
            setIsLoading(false);
            // window.location.href = '/dashboard/login';
        }
    };

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

    const menuItems = [
        {
            id: "software",
            label: "Software & Tech",
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
                    <Navbar menuItems={menuItems} activeMenu={activeMenu} setActiveMenu={setActiveMenu} activeView={activeView} setActiveView={setActiveView} />
                    <div className="bg-white">
                        <SimpleNav />
                        <IdeaComponent ideas={ideas} />
                    </div>
                </>

            )}
        </>
    );
}
