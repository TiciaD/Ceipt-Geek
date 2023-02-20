import { useState } from "react";
import WelcomeCard from "../components/WelcomeCard";
import Dashboard from "../components/Dashboard";

export default function Home() {
  // Temporary Auth state until Authentication is implemented
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return <div>{isAuthenticated ? <Dashboard /> : <WelcomeCard />}</div>;
}
