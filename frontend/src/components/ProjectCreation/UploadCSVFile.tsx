import { FC } from 'react';
import { getClasses } from "./styles.ts";
import { useCSVReader } from "react-papaparse";
import { CSVFileProps } from './types';

export const UploadCSVFile: FC<CSVFileProps> = ({
  setCsvFileData,
  setCsvUserData
  }) => {
    const { CSVReader } = useCSVReader();

    const classes = getClasses();

    const curFileData: string[] = [];
    const curUserData: string[] = [];
  
  const uploadedFile = (filtered: string[][]) => {        
    filtered.map((row) => {
      if(row[0]) {
        const csvFileData = `${row[0]}${row[1]}${row[2]}`; 
        curFileData.push(csvFileData);
  
        let csvUserData: string[] = [];
        for (let i = 1; i < row.length; i++) {
          row[i] !== undefined && csvUserData.push(row[i]);
        }
      }
    })
    setCsvFileData(curFileData);
    setCsvUserData(curUserData);    
  }

  return (
    <CSVReader
        onUploadAccepted={(results: any) => {
            const value: string[][] = results.data;
            
            const filtered = value.filter((_, i) => i !== 0);
            uploadedFile(filtered);
        }}
        config={{ worker: true }}
       noDrag>
      {({
        getRootProps,
        acceptedFile,
      }: any) => (
        <>
          <div {...getRootProps()}>
            {acceptedFile ? (                
              <>
                <div>{acceptedFile.name}</div>
              </>
            ) : (
              <button className={classes.uploadCSV}>Upload CSV file</button>
            )}
          </div>
        </>
      )}
    </CSVReader>
  );
}