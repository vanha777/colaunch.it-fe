import { Suspense } from "react";
import SimpleLoading from "./components/simpleLoading";
import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";
import { UserData } from "../utils/AppContext";

export default function Dashboard({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const initialUser = searchParams.user;
  console.log("initialUser", initialUser);
  return (
    <Suspense fallback={<SimpleLoading />}>
      <DashboardClient rawUser={initialUser} />
    </Suspense>
  );
}
