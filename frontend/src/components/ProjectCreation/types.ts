import { SetStateAction } from "react";

export type CSVFileProps<> = {
  setCsvFileData: (csvFileData: SetStateAction<string[]>) => void;
  setCsvUserData: (csvUserData: SetStateAction<string[]>) => void;
};

export type CsvFileData = string[] 
export type CsvUserData = string[]

export type requestResults = {
  createResult: any,
  ownerResult: any,
}

export type resultsObj = {
  Project?: string,
  Result?: string,
  project?: string,
  result?: string,
  username?: string,
  User?: string,
  Password?: string,
}