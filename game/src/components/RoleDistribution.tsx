"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDuration(startTime: number, endTime: number): string {
  const durationMs = endTime - startTime;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes} dakika ${seconds} saniye`;
  }
  return `${seconds} saniye`;
}

export function RoleDistribution() {
  const {
    gamePhase,
    currentPlayerIndex,
    players,
    selectedAnswer,
    nextPlayer,
    resetGame,
    finishGame,
    restartGame,
    activeSpecialMode,
    subjects,
    settings,
    gameStartTime,
    gameEndTime,
  } = useGameStore();

  const selectedSubject = subjects.find(
    (s) => s.id === settings.selectedSubjectId,
  );
  const [showRole, setShowRole] = useState(false);

  // Reset showRole when game restarts (players array changes)
  useEffect(() => {
    if (gamePhase === "distributing") {
      setShowRole(false);
    }
  }, [gamePhase, players]);

  // Role Distribution Phase
  if (gamePhase === "distributing") {
    const currentPlayer = players[currentPlayerIndex];
    const isLastPlayer = currentPlayerIndex === players.length - 1;

    const handleReadyClick = () => {
      setShowRole(true);
    };

    const handleNextClick = () => {
      setShowRole(false);
      nextPlayer();
    };

    if (!showRole) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="text-center w-full max-w-md h-[400px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-2xl font-bold">
                Oyuncu {currentPlayer.playerId}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {selectedSubject?.name || "Rastgele"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full">
                  <div className="bg-muted border p-6 rounded-lg h-[120px] flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-center">
                      Hazır mısın?
                    </h2>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleReadyClick}
                className="w-full h-12 text-lg font-semibold"
              >
                Rolümü Göster
              </Button>

              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetGame}
                  className="flex-1"
                >
                  Ana Sayfa
                </Button>
                <div className="px-4 text-center">
                  <span className="text-xs text-muted-foreground">
                    {currentPlayerIndex + 1} / {players.length}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restartGame}
                  className="flex-1"
                >
                  Yeniden
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="text-center w-full max-w-md h-[400px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-2xl font-bold">
              Oyuncu {currentPlayer.playerId}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {selectedSubject?.name || "Rastgele"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="flex-1 flex items-center justify-center">
              {currentPlayer.role === "spy" ? (
                <div className="w-full">
                  <div className="bg-red-950/50 border border-red-800 p-6 rounded-lg h-[120px] flex flex-col justify-center">
                    <h2 className="text-2xl font-bold  text-red-400 text-center">
                      Casus
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="bg-blue-950/50 border border-blue-800 p-6 rounded-lg h-[120px] flex flex-col justify-center">
                    <p className="text-2xl font-bold text-blue-200 text-center break-words">
                      {currentPlayer.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleNextClick}
              className="w-full h-12 text-lg font-semibold"
            >
              {isLastPlayer ? "Oyunu Başlat" : "Sonraki Oyuncu"}
            </Button>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetGame}
                className="flex-1"
              >
                Ana Sayfa
              </Button>
              <div className="px-4 text-center">
                <span className="text-xs text-muted-foreground">
                  {currentPlayerIndex + 1} / {players.length}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={restartGame}
                className="flex-1"
              >
                Yeniden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game Started Phase
  if (gamePhase === "started") {
    // Live timer component
    function LiveTimer() {
      const [currentTime, setCurrentTime] = useState(Date.now());

      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(interval);
      }, []);

      const elapsedTime = gameStartTime
        ? formatDuration(gameStartTime, currentTime)
        : "0 saniye";

      return (
        <div className="w-full">
          <div className="bg-muted border p-6 rounded-lg h-[120px] flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-center tabular-nums min-w-[200px] mx-auto">
              {elapsedTime}
            </h2>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="text-center w-full max-w-md h-[400px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-2xl font-bold">Oyun Başladı!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="flex-1 flex items-center justify-center">
              <LiveTimer />
            </div>

            <Button
              onClick={finishGame}
              className="w-full h-12 text-lg font-semibold"
              variant="destructive"
            >
              Oyunu Bitir
            </Button>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetGame}
                className="flex-1 mr-2"
              >
                Ana Sayfa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={restartGame}
                className="flex-1 ml-2"
              >
                Yeniden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game Finished Phase
  if (gamePhase === "finished") {
    const spyPlayers = players.filter((p) => p.role === "spy");
    const gameDuration =
      gameStartTime && gameEndTime
        ? formatDuration(gameStartTime, gameEndTime)
        : "Bilinmiyor";

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">
              Oyun Sonuçları
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{gameDuration}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Answer */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {selectedSubject?.name}
              </p>
              <p className="text-lg font-semibold break-words">
                {selectedAnswer}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{players.length}</p>
                <p className="text-xs text-muted-foreground">Oyuncu</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{spyPlayers.length}</p>
                <p className="text-xs text-muted-foreground">Casus</p>
              </div>
            </div>

            {/* Spies */}
            {spyPlayers.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Casuslar:</p>
                <div className="flex flex-wrap gap-2">
                  {spyPlayers.map((spy) => (
                    <span
                      key={spy.playerId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive"
                    >
                      Oyuncu {spy.playerId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special Mode */}
            {activeSpecialMode && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 text-center">
                  Özel Mod:{" "}
                  {activeSpecialMode === "everyone-spy"
                    ? "Herkes Casus"
                    : activeSpecialMode === "everyone-knows"
                      ? "Herkes Biliyor"
                      : "Herkes Farklı"}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={resetGame} variant="outline">
                Ana Menü
              </Button>
              <Button onClick={restartGame}>Yeniden</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback
  return null;
}
