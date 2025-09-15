"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameStore, PlayerRole, Subject } from "@/types/game";
import defaultSubjects from "@/data/subjects.json";

// Crypto-based random number generator
const getSecureRandom = (max: number): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
};

// Get random percentage (0-99)
const getRandomPercentage = (): number => {
  return getSecureRandom(100);
};

// Shuffle array using Fisher-Yates algorithm with crypto randomness
const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandom(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      gamePhase: "setup" as const,
      currentPlayerIndex: 0,
      players: [],
      selectedAnswer: "",
      gameHistory: [],
      activeSpecialMode: null,
      gameStartTime: undefined,
      gameEndTime: undefined,

      // Settings
      settings: {
        selectedSubjectId: "random",
        playerCount: 6,
        spyCount: 1,
        everyoneIsSpy: false,
        everyoneKnows: false,
        everyoneDifferent: false,
      },

      // Subjects (default + any custom subjects from localStorage)
      subjects: defaultSubjects.subjects,
      customSubjects: [],

      // Actions
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      setSubjects: (subjects) => {
        set({ subjects });
      },

      startGame: () => {
        const { settings, subjects, gameHistory } = get();

        // Handle random subject selection
        let selectedSubject;
        if (settings.selectedSubjectId === "random") {
          // Pick a random subject
          const randomIndex = getSecureRandom(subjects.length);
          selectedSubject = subjects[randomIndex];
        } else {
          selectedSubject = subjects.find(
            (s) => s.id === settings.selectedSubjectId,
          );
        }

        if (!selectedSubject || selectedSubject.items.length === 0) return;

        // Get enabled items (filter out disabled items)
        const disabledItems = selectedSubject.disabledItems || [];
        const enabledItems = selectedSubject.items.filter(
          (item) => !disabledItems.includes(item),
        );

        if (enabledItems.length === 0) return; // No enabled items

        // Filter out recently used locations (last 5)
        const recentLocations = gameHistory.slice(-5);
        const availableLocations = enabledItems.filter(
          (item) => !recentLocations.includes(item),
        );

        // If all enabled locations were recent, use all enabled locations
        const locationsToUse =
          availableLocations.length > 0 ? availableLocations : enabledItems;

        // Select random answer
        const answerIndex = getSecureRandom(locationsToUse.length);
        const selectedAnswer = locationsToUse[answerIndex];

        // Check for special modes (5% chance each)
        const enabledModes: string[] = [];

        // Check each enabled special mode independently (5% chance each)
        if (settings.everyoneIsSpy && getRandomPercentage() < 5) {
          enabledModes.push("everyone-spy");
        }
        if (settings.everyoneKnows && getRandomPercentage() < 5) {
          enabledModes.push("everyone-knows");
        }
        if (settings.everyoneDifferent && getRandomPercentage() < 5) {
          enabledModes.push("everyone-different");
        }

        // If multiple modes triggered, pick one randomly
        let activeSpecialMode:
          | "everyone-spy"
          | "everyone-knows"
          | "everyone-different"
          | null = null;

        if (enabledModes.length > 0) {
          const randomModeIndex = getSecureRandom(enabledModes.length);
          activeSpecialMode = enabledModes[randomModeIndex] as
            | "everyone-spy"
            | "everyone-knows"
            | "everyone-different";
        }

        // Set individual flags for role generation logic
        const specialEveryoneIsSpy = activeSpecialMode === "everyone-spy";
        const specialEveryoneKnows = activeSpecialMode === "everyone-knows";
        const specialEveryoneDifferent =
          activeSpecialMode === "everyone-different";

        // Generate player roles
        const players: PlayerRole[] = [];

        if (specialEveryoneIsSpy) {
          // Special mode: Everyone is a spy
          for (let i = 0; i < settings.playerCount; i++) {
            players.push({
              playerId: i + 1,
              role: "spy",
            });
          }
        } else if (specialEveryoneKnows) {
          // Special mode: Everyone knows the answer
          for (let i = 0; i < settings.playerCount; i++) {
            players.push({
              playerId: i + 1,
              role: "normal",
              answer: selectedAnswer,
            });
          }
        } else if (specialEveryoneDifferent) {
          // Special mode: Everyone gets different answers, no spies
          const availableAnswers = [...enabledItems];

          for (let i = 0; i < settings.playerCount; i++) {
            let playerAnswer;

            if (availableAnswers.length > 0) {
              // Remove a random answer from available ones
              const answerIndex = getSecureRandom(availableAnswers.length);
              playerAnswer = availableAnswers.splice(answerIndex, 1)[0];
            } else {
              // If we run out of unique answers, start reusing enabled items
              playerAnswer = enabledItems[getSecureRandom(enabledItems.length)];
            }

            players.push({
              playerId: i + 1,
              role: "normal",
              answer: playerAnswer,
            });
          }
        } else {
          // Normal mode: Create array with spy and normal roles
          const roles: ("spy" | "normal")[] = [];

          // Add spies
          for (let i = 0; i < settings.spyCount; i++) {
            roles.push("spy");
          }

          // Add normal roles
          for (let i = 0; i < settings.playerCount - settings.spyCount; i++) {
            roles.push("normal");
          }

          // Shuffle roles
          const shuffledRoles = shuffleArray(roles);

          // Assign roles to players
          for (let i = 0; i < settings.playerCount; i++) {
            players.push({
              playerId: i + 1,
              role: shuffledRoles[i],
              answer:
                shuffledRoles[i] === "normal" ? selectedAnswer : undefined,
            });
          }
        }

        // Update game history
        const updatedHistory = [...gameHistory, selectedAnswer].slice(-5);

        set({
          gamePhase: "distributing",
          currentPlayerIndex: 0,
          players,
          selectedAnswer,
          gameHistory: updatedHistory,
          activeSpecialMode,
          gameStartTime: undefined,
          gameEndTime: undefined,
        });
      },

      nextPlayer: () => {
        const { currentPlayerIndex, players } = get();
        if (currentPlayerIndex < players.length - 1) {
          set({ currentPlayerIndex: currentPlayerIndex + 1 });
        } else {
          // All players have seen their roles, start the actual game
          set({
            gamePhase: "started",
            gameStartTime: Date.now(),
          });
        }
      },

      finishGame: () => {
        set({
          gamePhase: "finished",
          gameEndTime: Date.now(),
        });
      },

      restartGame: () => {
        // Generate a completely new game with same settings
        get().startGame();
      },

      resetGame: () => {
        set({
          gamePhase: "setup",
          currentPlayerIndex: 0,
          players: [],
          selectedAnswer: "",
          activeSpecialMode: null,
          gameStartTime: undefined,
          gameEndTime: undefined,
        });
      },

      addCustomSubject: (subject) => {
        const { customSubjects } = get();
        const newCustomSubjects = [...customSubjects, subject];
        const newSubjects = [...defaultSubjects.subjects, ...newCustomSubjects];
        set({ subjects: newSubjects, customSubjects: newCustomSubjects });
      },

      updateCustomSubject: (subject) => {
        const { customSubjects } = get();
        const updatedCustomSubjects = customSubjects.map((s) =>
          s.id === subject.id ? subject : s,
        );
        const newSubjects = [
          ...defaultSubjects.subjects,
          ...updatedCustomSubjects,
        ];
        set({ subjects: newSubjects, customSubjects: updatedCustomSubjects });
      },

      deleteCustomSubject: (id) => {
        const { customSubjects, settings } = get();
        const updatedCustomSubjects = customSubjects.filter((s) => s.id !== id);
        const newSubjects = [
          ...defaultSubjects.subjects,
          ...updatedCustomSubjects,
        ];

        // If deleted subject was selected, switch to first available
        const newSettings =
          settings.selectedSubjectId === id
            ? {
                ...settings,
                selectedSubjectId: newSubjects[0]?.id || "countries",
              }
            : settings;

        set({
          subjects: newSubjects,
          customSubjects: updatedCustomSubjects,
          settings: newSettings,
        });
      },

      openListManagement: () => {
        set({ gamePhase: "manage-lists" });
      },

      toggleItemInSubject: (subjectId, item) => {
        const { subjects, customSubjects } = get();
        const subject = subjects.find((s) => s.id === subjectId);
        if (!subject) return;

        // Check if this is a default subject that needs to be moved to custom
        const isDefaultSubject = defaultSubjects.subjects.some(
          (ds) => ds.id === subjectId,
        );

        if (isDefaultSubject) {
          // Create or update custom version of default subject
          const existingCustom = customSubjects.find(
            (cs) => cs.id === subjectId,
          );
          let disabledItems = existingCustom?.disabledItems || [];

          if (disabledItems.includes(item)) {
            // Enable item (remove from disabled)
            disabledItems = disabledItems.filter((i) => i !== item);
          } else {
            // Disable item (add to disabled)
            disabledItems = [...disabledItems, item];
          }

          const updatedCustomSubject = {
            ...subject,
            disabledItems,
            isCustom: false, // Keep as default subject but with modifications
          };

          const updatedCustomSubjects = existingCustom
            ? customSubjects.map((cs) =>
                cs.id === subjectId ? updatedCustomSubject : cs,
              )
            : [...customSubjects, updatedCustomSubject];

          const newSubjects = subjects.map((s) =>
            s.id === subjectId ? updatedCustomSubject : s,
          );

          set({ subjects: newSubjects, customSubjects: updatedCustomSubjects });
        } else {
          // Handle custom subject
          let disabledItems = subject.disabledItems || [];

          if (disabledItems.includes(item)) {
            disabledItems = disabledItems.filter((i) => i !== item);
          } else {
            disabledItems = [...disabledItems, item];
          }

          const updatedSubject = { ...subject, disabledItems };
          const updatedCustomSubjects = customSubjects.map((cs) =>
            cs.id === subjectId ? updatedSubject : cs,
          );
          const newSubjects = subjects.map((s) =>
            s.id === subjectId ? updatedSubject : s,
          );

          set({ subjects: newSubjects, customSubjects: updatedCustomSubjects });
        }
      },

      addItemToSubject: (subjectId, item) => {
        const { subjects, customSubjects } = get();
        const subject = subjects.find((s) => s.id === subjectId);
        if (!subject || subject.items.includes(item)) return;

        const isDefaultSubject = defaultSubjects.subjects.some(
          (ds) => ds.id === subjectId,
        );

        if (isDefaultSubject) {
          // Create or update custom version of default subject
          const existingCustom = customSubjects.find(
            (cs) => cs.id === subjectId,
          );
          const updatedCustomSubject = {
            ...subject,
            items: [...subject.items, item],
            isCustom: false,
          };

          const updatedCustomSubjects = existingCustom
            ? customSubjects.map((cs) =>
                cs.id === subjectId ? updatedCustomSubject : cs,
              )
            : [...customSubjects, updatedCustomSubject];

          const newSubjects = subjects.map((s) =>
            s.id === subjectId ? updatedCustomSubject : s,
          );

          set({ subjects: newSubjects, customSubjects: updatedCustomSubjects });
        } else {
          // Handle custom subject
          const updatedSubject = {
            ...subject,
            items: [...subject.items, item],
          };

          const updatedCustomSubjects = customSubjects.map((cs) =>
            cs.id === subjectId ? updatedSubject : cs,
          );
          const newSubjects = subjects.map((s) =>
            s.id === subjectId ? updatedSubject : s,
          );

          set({ subjects: newSubjects, customSubjects: updatedCustomSubjects });
        }
      },

      clearCustomData: () => {
        // Reset subjects to defaults and clear custom data
        set({
          subjects: defaultSubjects.subjects,
          customSubjects: [],
          gameHistory: [],
        });
      },
    }),
    {
      name: "spy-game-store",
      partialize: (state) => ({
        customSubjects: state.customSubjects,
        settings: state.settings,
        gameHistory: state.gameHistory,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Combine default subjects with custom subjects from localStorage
          // Apply any custom modifications to default subjects
          const customModifications = (state.customSubjects || []).reduce(
            (acc, customSubject) => {
              acc[customSubject.id] = customSubject;
              return acc;
            },
            {} as Record<string, Subject>,
          );

          const mergedSubjects = defaultSubjects.subjects.map(
            (defaultSubject) => {
              const customMod = customModifications[defaultSubject.id];
              if (customMod && !customMod.isCustom) {
                // This is a modified default subject
                return { ...defaultSubject, ...customMod };
              }
              return defaultSubject;
            },
          );

          // Add purely custom subjects
          const purelyCustomSubjects = (state.customSubjects || []).filter(
            (cs) => cs.isCustom,
          );

          state.subjects = [...mergedSubjects, ...purelyCustomSubjects];
        }
      },
    },
  ),
);
