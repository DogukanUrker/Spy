export interface Subject {
  id: string;
  name: string;
  items: string[];
  isCustom?: boolean;
  disabledItems?: string[];
}

export interface SubjectsData {
  subjects: Subject[];
}

export interface GameSettings {
  selectedSubjectId: string;
  playerCount: number;
  spyCount: number;
  everyoneIsSpy: boolean;
  everyoneKnows: boolean;
  everyoneDifferent: boolean;
}

export interface PlayerRole {
  playerId: number;
  role: "spy" | "normal";
  answer?: string;
}

export interface GameState {
  gamePhase: "setup" | "distributing" | "started" | "finished" | "manage-lists";
  currentPlayerIndex: number;
  players: PlayerRole[];
  selectedAnswer: string;
  gameHistory: string[];
  activeSpecialMode?:
    | "everyone-spy"
    | "everyone-knows"
    | "everyone-different"
    | null;
  gameStartTime?: number;
  gameEndTime?: number;
}

export interface GameStore extends GameState {
  settings: GameSettings;
  subjects: Subject[];
  customSubjects: Subject[];

  // Actions
  updateSettings: (settings: Partial<GameSettings>) => void;
  setSubjects: (subjects: Subject[]) => void;
  startGame: () => void;
  nextPlayer: () => void;
  finishGame: () => void;
  restartGame: () => void;
  resetGame: () => void;
  addCustomSubject: (subject: Subject) => void;
  updateCustomSubject: (subject: Subject) => void;
  deleteCustomSubject: (id: string) => void;
  openListManagement: () => void;
  toggleItemInSubject: (subjectId: string, item: string) => void;
  addItemToSubject: (subjectId: string, item: string) => void;
  clearCustomData: () => void;
}
