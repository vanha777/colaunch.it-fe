import { redirect } from "next/navigation";
import IdeaCard, { IdeaProps, OfferProps } from "./components/ideaCard";
import { Db, Server } from "@/app/utils/db";
import { AppProvider, useAppContext, UserData } from "@/app/utils/AppContext";
import { useEffect, useState } from "react";
import SimpleNav from "@/app/dashboard/components/simpleNav";
import SimpleSideBar from "@/app/dashboard/components/simpleSideBar";
import SimpleNavBar from "@/app/dashboard/components/simpleNavBar";
import Main from "./components/main";
export const revalidate = 0
export default async function IdeaPage({ params }: { params: { id: string } }) {
  console.log('user ID:', params.id);
  return (
    <Main />
  )
}
