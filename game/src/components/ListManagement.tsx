"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Subject } from "@/types/game";
import { cn } from "@/lib/utils";

export function ListManagement() {
  const {
    subjects,
    resetGame,
    addCustomSubject,
    toggleItemInSubject,
    addItemToSubject,
    clearCustomData,
  } = useGameStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [newItemInput, setNewItemInput] = useState("");
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const selectedSubject = selectedSubjectId
    ? subjects.find((s) => s.id === selectedSubjectId)
    : null;

  const getEnabledItems = (subject: Subject) => {
    const disabledItems = subject.disabledItems || [];
    return subject.items.filter((item) => !disabledItems.includes(item));
  };

  const handleToggleItem = (subjectId: string, item: string) => {
    toggleItemInSubject(subjectId, item);
  };

  const handleAddItem = () => {
    if (newItemInput.trim() && selectedSubjectId) {
      addItemToSubject(selectedSubjectId, newItemInput.trim());
      setNewItemInput("");
    }
  };

  const handleCreateNewList = () => {
    if (newListName.trim()) {
      const newSubject: Subject = {
        id: `custom-${Date.now()}`,
        name: newListName.trim(),
        items: [],
        isCustom: true,
        disabledItems: [],
      };
      addCustomSubject(newSubject);
      setNewListName("");
      setIsCreatingList(false);
      setSelectedSubjectId(newSubject.id);
    }
  };

  const handleClearStorage = () => {
    clearCustomData();
    setSelectedSubjectId(null);
    setShowDeleteDialog(false);
  };

  if (!selectedSubject && !isCreatingList) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              Liste Yönetimi
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Düzenlemek istediğiniz listeyi seçin
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Create New List Button */}
            <Button
              onClick={() => setIsCreatingList(true)}
              className="w-full"
              variant="outline"
            >
              Yeni Liste Oluştur
            </Button>

            {/* Subject List */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mevcut Listeler</label>
              <div className="h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
                {subjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Henüz liste bulunmuyor.
                    <br />
                    Yukarıdan yeni liste oluşturabilirsiniz.
                  </p>
                ) : (
                  subjects.map((subject) => {
                    const enabledCount = getEnabledItems(subject).length;
                    const totalCount = subject.items.length;
                    return (
                      <div
                        key={subject.id}
                        onClick={() => setSelectedSubjectId(subject.id)}
                        className="flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        <div className="text-left">
                          <div className="font-medium">{subject.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {subject.isCustom && "Özel liste"}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {enabledCount}/{totalCount}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Storage Management */}
            <div className="pt-4 border-t space-y-2">
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    className={cn(
                      buttonVariants({ variant: "destructive" }),
                      "w-full",
                    )}
                  >
                    Tüm Özel Verileri Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Emin misin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Oluşturduğun tüm özel listeler, liste değişiklikleri ve
                      oyun geçmişi silinecek. Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearStorage}
                      className={cn(buttonVariants({ variant: "destructive" }))}
                    >
                      Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                onClick={resetGame}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Ana Menüye Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCreatingList) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              Yeni Liste Oluştur
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Liste Adı</label>
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Örn: Filmler, Şarkılar, vb..."
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateNewList}
                disabled={!newListName.trim()}
                className="flex-1"
              >
                Oluştur
              </Button>
              <Button
                onClick={() => setIsCreatingList(false)}
                variant="outline"
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                {selectedSubject!.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getEnabledItems(selectedSubject!).length}/
                {selectedSubject!.items.length} öğe aktif
              </p>
            </div>
            <Button
              onClick={() => setSelectedSubjectId(null)}
              variant="ghost"
              size="sm"
            >
              Geri
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Add New Item */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Yeni Öğe Ekle</label>
            <div className="flex gap-2">
              <Input
                value={newItemInput}
                onChange={(e) => setNewItemInput(e.target.value)}
                placeholder="Yeni öğe adı..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddItem();
                  }
                }}
              />
              <Button
                onClick={handleAddItem}
                disabled={!newItemInput.trim()}
                size="sm"
              >
                Ekle
              </Button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Liste Öğeleri</label>
            <div className="h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
              {selectedSubject!.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Bu listede henüz öğe bulunmuyor.
                  <br />
                  Yukarıdan yeni öğeler ekleyebilirsiniz.
                </p>
              ) : (
                selectedSubject!.items.map((item, index) => {
                  const isDisabled =
                    selectedSubject!.disabledItems?.includes(item) || false;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <span
                        className={
                          isDisabled ? "text-muted-foreground line-through" : ""
                        }
                      >
                        {item}
                      </span>
                      <Switch
                        checked={!isDisabled}
                        onCheckedChange={() =>
                          handleToggleItem(selectedSubject!.id, item)
                        }
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Back Button */}
          <Button onClick={resetGame} variant="outline" className="w-full">
            Ana Menüye Dön
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
