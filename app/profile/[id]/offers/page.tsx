import { redirect } from "next/navigation";
import SimpleNavBar from "./../components/simpleNavBar";
import { Db, Server } from "@/app/utils/db";
import { AppProvider, useAppContext, UserData } from "@/app/utils/AppContext";
import { useEffect, useState } from "react";
import SimpleNav from "@/app/dashboard/components/simpleNav";
import OfferCard from "./components/offerCard";
export const revalidate = 0
export default async function IdeaPage({ params }: { params: { id: string } }) {
  console.log('user ID:', params.id);
  return (
    <>
      <SimpleNavBar />
      <div className="container mx-auto p-4">
      <SimpleNav />
        <OfferCard />
      </div>
    </>
  );
}
