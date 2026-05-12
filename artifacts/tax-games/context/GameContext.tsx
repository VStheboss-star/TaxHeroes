import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type GameKey = "quiz" | "catch" | "budget" | "trail" | "memory" | "scramble";

interface GameScores {
  quiz: number;
  catch: number;
  budget: number;
  trail: number;
  memory: number;
  scramble: number;
}

interface GameContextType {
  scores: GameScores;
  totalScore: number;
  gamesCompleted: number;
  updateScore: (game: GameKey, score: number) => void;
  markCompleted: (game: GameKey) => void;
  completedGames: Set<GameKey>;
}

const GameContext = createContext<GameContextType | null>(null);

const STORAGE_KEY = "taxquest_v2";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [scores, setScores] = useState<GameScores>({
    quiz: 0,
    catch: 0,
    budget: 0,
    trail: 0,
    memory: 0,
    scramble: 0,
  });
  const [completedGames, setCompletedGames] = useState<Set<GameKey>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.scores) setScores(data.scores);
          if (data.completed) setCompletedGames(new Set(data.completed));
        }
      } catch {}
    })();
  }, []);

  const persist = (newScores: GameScores, newCompleted: Set<GameKey>) => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ scores: newScores, completed: [...newCompleted] })
    ).catch(() => {});
  };

  const updateScore = (game: GameKey, score: number) => {
    setScores((prev) => {
      const updated = { ...prev, [game]: Math.max(prev[game], score) };
      persist(updated, completedGames);
      return updated;
    });
  };

  const markCompleted = (game: GameKey) => {
    setCompletedGames((prev) => {
      const updated = new Set(prev);
      updated.add(game);
      persist(scores, updated);
      return updated;
    });
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const gamesCompleted = completedGames.size;

  return (
    <GameContext.Provider
      value={{
        scores,
        totalScore,
        gamesCompleted,
        updateScore,
        markCompleted,
        completedGames,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
