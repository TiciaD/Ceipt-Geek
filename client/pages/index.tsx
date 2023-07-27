import { useEffect, useState } from "react";
import WelcomeCard from "../components/WelcomeCard";
import Dashboard from "../components/Dashboard";
import { useAuth } from "../utils/useAuth";
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';

export type DashboardProps = {
  router: NextRouter;
}
export default function Home() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const { userToken } = useAuth();
  const router = useRouter()
  
  useEffect(() => {
    if (userToken) {
      setAuthToken(userToken);
    } else {
      setAuthToken(null)
    }
  }, [userToken, authToken]);

  return <div>{authToken ? <Dashboard /> : <WelcomeCard />}</div>;
}
