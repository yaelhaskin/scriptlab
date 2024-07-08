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

  const uploadedFile = (filtered: string[][]) => {                
    let curFileData: string[] = [];
    let allUserData: string[][] = [];
    filtered.map((row) => {                  
      curFileData.push(row[0]);

      let curUserData: string[] = [];
      for (let i = 1; i < row.length; i++) {        
        curUserData.push(row[i]);
      }
      allUserData.push(curUserData);
    })    
    setCsvFileData(curFileData);
    setCsvUserData(allUserData);    
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