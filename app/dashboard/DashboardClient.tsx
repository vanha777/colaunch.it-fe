"use client";
import { AppProvider, useAppContext, UserData } from "@/app/utils/AppContext";
import MainUniverse from "./components/mainUniverse";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Db, Server } from "@/app/utils/db";
import SimpleLoading from "./components/simpleLoading";
import { set } from "date-fns";

interface InitialUserProps {
    initialUser: UserData;
}

export default function DashboardClient({ initialUser }: InitialUserProps) {
    const { auth, setAccessToken, setUser, setGame, setTokenData, logout } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log("this is data", initialUser);
                // // Fetch game data
                // const { data: userData, error: gameError } = await Db.from('users').select('*').eq('email', initialUser.email);
                // console.log("userData", userData);
                setUser(initialUser);
            } catch (error) {
                console.error('Error fetching data:', error);
                router.push("/dashboard/login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [initialUser]);

    return isLoading ? <SimpleLoading /> : <MainUniverse />;
}
