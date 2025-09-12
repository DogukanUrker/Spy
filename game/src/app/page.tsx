"use client";

import { useGameStore } from "@/store/gameStore";
import { HomeScreen } from "@/components/HomeScreen";
import { RoleDistribution } from "@/components/RoleDistribution";
import { ListManagement } from "@/components/ListManagement";

export default function Home() {
  const { gamePhase } = useGameStore();

  return (
    <div className="min-h-screen bg-background">
      {gamePhase === "setup" ? (
        <HomeScreen />
      ) : gamePhase === "manage-lists" ? (
        <ListManagement />
      ) : (
        <RoleDistribution />
      )}
    </div>
  );
}
