import { Holding } from "../types";

// AI functionality has been removed from the application
export const getETFInfo = async (ticker: string): Promise<{ name: string; sector: string } | null> => {
  return null;
};

export const analyzePortfolio = async (holdings: Holding[]): Promise<string> => {
  return "";
};