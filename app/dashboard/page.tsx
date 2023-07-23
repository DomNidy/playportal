import DashboardRedirectHandler from "../components/DashboardRedirectHandler";
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-neutral-200">
      <Suspense>
        <DashboardRedirectHandler />
      </Suspense>
      <h1 className="text-3xl text-gray-800 font-bold">Dashboard</h1>
    </div>
  );
}
