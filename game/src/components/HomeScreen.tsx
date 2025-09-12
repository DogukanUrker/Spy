"use client";

import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export function HomeScreen() {
  const { settings, subjects, updateSettings, startGame, openListManagement } =
    useGameStore();

  const selectedSubject = subjects.find(
    (s) => s.id === settings.selectedSubjectId,
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Casus Kim?</h1>

        <div className="space-y-6">
          {/* Subject Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Konu Seçin</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={settings.selectedSubjectId}
                onValueChange={(value) =>
                  updateSettings({ selectedSubjectId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bir konu seçin" />
                </SelectTrigger>
                <SelectContent>
                  {/* Custom subjects first */}
                  {subjects
                    .filter((subject) => subject.isCustom)
                    .map((subject) => {
                      const disabledItems = subject.disabledItems || [];
                      const enabledCount = subject.items.filter(
                        (item) => !disabledItems.includes(item),
                      ).length;
                      return (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({enabledCount}/{subject.items.length}{" "}
                          öğe)
                        </SelectItem>
                      );
                    })}

                  {/* Default subjects */}
                  {subjects
                    .filter((subject) => !subject.isCustom)
                    .map((subject) => {
                      const disabledItems = subject.disabledItems || [];
                      const enabledCount = subject.items.filter(
                        (item) => !disabledItems.includes(item),
                      ).length;
                      return (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({enabledCount}/{subject.items.length}{" "}
                          öğe)
                        </SelectItem>
                      );
                    })}

                  {/* Rastgele option at the bottom */}
                  <SelectItem value="random">
                    Rastgele Seç (
                    {subjects.reduce((total, subject) => {
                      const disabledItems = subject.disabledItems || [];
                      const enabledCount = subject.items.filter(
                        (item) => !disabledItems.includes(item),
                      ).length;
                      return total + enabledCount;
                    }, 0)}{" "}
                    öğe)
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-4">
                <Button
                  onClick={openListManagement}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Listeleri Yönet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Player Count */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Oyuncu Sayısı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Toplam oyuncu: {settings.playerCount}
                  </span>
                </div>
                <Slider
                  value={[settings.playerCount]}
                  onValueChange={(value) => {
                    const newPlayerCount = value[0];
                    const newSpyCount = Math.min(
                      settings.spyCount,
                      Math.floor(newPlayerCount / 2),
                    );
                    updateSettings({
                      playerCount: newPlayerCount,
                      spyCount: newSpyCount,
                    });
                  }}
                  min={3}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3</span>
                  <span>20</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spy Count */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Casus Sayısı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Casus sayısı: {settings.spyCount}
                  </span>
                </div>
                <Slider
                  value={[settings.spyCount]}
                  onValueChange={(value) =>
                    updateSettings({ spyCount: value[0] })
                  }
                  min={1}
                  max={Math.min(10, Math.floor(settings.playerCount / 2))}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>
                    {Math.min(10, Math.floor(settings.playerCount / 2))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Modes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Özel Modlar</CardTitle>
              <p className="text-sm text-muted-foreground">
                Bu modlar açık olduğunda %5 ihtimalle etkinleşir
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label htmlFor="everyone-spy" className="text-sm font-medium">
                    Herkes Casus
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Tüm oyuncular casus olur (ama diğerlerinin de casus olduğunu
                    bilmez)
                  </p>
                </div>
                <Switch
                  id="everyone-spy"
                  checked={settings.everyoneIsSpy}
                  onCheckedChange={(checked) =>
                    updateSettings({ everyoneIsSpy: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label
                    htmlFor="everyone-knows"
                    className="text-sm font-medium"
                  >
                    Herkes Biliyor
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Casus olmaz, herkes cevabı bilir (ama bunu bilmez)
                  </p>
                </div>
                <Switch
                  id="everyone-knows"
                  checked={settings.everyoneKnows}
                  onCheckedChange={(checked) =>
                    updateSettings({ everyoneKnows: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label
                    htmlFor="everyone-different"
                    className="text-sm font-medium"
                  >
                    Herkes Farklı
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Casus olmaz, herkes farklı cevap alır
                  </p>
                </div>
                <Switch
                  id="everyone-different"
                  checked={settings.everyoneDifferent}
                  onCheckedChange={(checked) =>
                    updateSettings({ everyoneDifferent: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Start Game Button */}
          <Button
            onClick={
              settings.selectedSubjectId === "empty"
                ? openListManagement
                : startGame
            }
            className="w-full h-12 text-lg font-semibold"
            disabled={
              settings.selectedSubjectId !== "random" &&
              settings.selectedSubjectId !== "empty" &&
              (!selectedSubject || selectedSubject.items.length === 0)
            }
          >
            {settings.selectedSubjectId === "empty"
              ? "Liste Oluştur"
              : "Oyunu Başlat"}
          </Button>
        </div>
      </div>
    </div>
  );
}
