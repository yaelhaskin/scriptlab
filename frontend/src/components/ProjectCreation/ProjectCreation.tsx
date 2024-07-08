import { FC, useState } from 'react';
import { getClasses } from "./styles";
import { Button, Snackbar, Switch, FormControlLabel } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { SelectOption } from "../DropdownSelectBox/types.ts";
import { UploadCSVFile } from './UploadCSVFile';
import { ProjectCloning } from '../ProjectCloning/ProjectCloning.tsx';
import DropdownSelectBox from "../DropdownSelectBox/index.ts";

import { getAllGroupsQuery } from "./hooks/useAllGroupsQuery.ts";

import { createProjectsMutation } from './hooks/useCreateProjects.ts';
import { cloneProjectsMutation } from './hooks/useCloneProjects.ts';
import { CsvFileData, CsvUserData, resultsObj } from './types.ts';

import examplePic from "../../assets/exampleFiles/createProjectExample.png"

export const ProjectCreation: FC = () => {
  const { data: groups, isFetching: isGroupsLoading } = getAllGroupsQuery();

  const { mutate: cloneProjects, data: cloneResultsData, status: cloneStatus } = cloneProjectsMutation(); 
  const { mutate: createProjects, data: createResultsData, status: createStatus } = createProjectsMutation(); 
  
  const [csvFileData, setCsvFileData] = useState<CsvFileData>([]);
  const [csvUserData, setCsvUserData] = useState<CsvUserData>([]);
  
  const [selectedGroup, setSelectedGroup] = useState<SelectOption[]>([]);
  const [cloneProject, setCloneProject] = useState(false);
  const [cloneFromGroup, setCloneFromGroup] = useState<SelectOption[]>([]);
  const [cloneFromProject, setCloneFromProject] = useState<SelectOption[]>([]);    
  
  const [error, setError] = useState<string | null>(null);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [showPic, setShowPic] = useState(false);

  const classes = getClasses();
  
  const handleCreate = async () => {
    if (selectedGroup
       && csvFileData 
       && csvUserData
    ) {
        if (cloneProject) {
          if (cloneFromGroup && cloneFromProject) {
            await handleCloneProjects();
          } else {
            setError('Please fill out all the information');
            setSnackbarOpen(true);
          }
        } else {
          await handleCreateNewProjects();
        }
    } else {
      setError('Please fill out all the information');
      setSnackbarOpen(true);
    }
  }

  const handleCloneProjects = async() => {
    cloneProjects({
      project: `${cloneFromGroup[0].name}/${cloneFromProject[0].name}`,
      clone_paths: csvFileData?.map((name: string) => (`${selectedGroup[0]?.name}/${name}`))
    });
  };
  
  const handleCreateNewProjects = async() => {
    createProjects(
      csvFileData.map((name: string) => ({project: name, namespace: selectedGroup[0].name}))
    );    
  };

  const resultElements = (results: resultsObj[]) => {
    return results.map((obj: resultsObj) => ( <div key={obj.Project}> Project: {obj.Project}, Result: {obj.Result} </div> ))
  }

  return(
    <div className={classes.projectCreation}>
      <Button onClick={() => setShowPic((prev) => !prev)}><ArrowDropDownIcon style={showPic ? { transform: "rotate(180deg)"} : undefined}/>לדוגמה csv תמונת קובץ</Button>
      <UploadCSVFile setCsvFileData={setCsvFileData} setCsvUserData={setCsvUserData}/>

      <div>
        :בחרו את הקבוצה בה תרצו לפתוח את הפרוייקט החדש
        <DropdownSelectBox 
          options={!isGroupsLoading ? groups.map((group: { group_path: string; group_id: number }) => ({
            key: group.group_path,
            id: group.group_id,
            name: group.group_path,
          }))
          : [{name: "Loading...", id: 0}]
          } 
          multiple={false}
          onChange={setSelectedGroup} 
        />
      </div>

      {showPic && <img src={examplePic} alt='example'/>}
      <div className={classes.switchContianer}>

      <FormControlLabel control={<Switch checked={cloneProject} />} onChange={() => setCloneProject((prev) => !prev)} label="clone project" />
      </div>

      {cloneProject && <ProjectCloning setCloneFromGroup={setCloneFromGroup} setCloneFromProject={setCloneFromProject} />}

      <Button className={classes.uploadBtn} onClick={handleCreate}> {cloneProject ? "Clone" : "Create"} </Button>

      <div className={classes.resultsTitle}>results:</div>
      {<div className={classes.resultsContainer}> 
        {cloneProject 
          ? 
          (cloneStatus === "pending" ? "Pending..." : (cloneStatus === "success" && (resultElements(cloneResultsData)))) 
          : 
          (createStatus === "pending" ? "Pending..." : (createStatus === "success" && (resultElements(createResultsData))))
        }
      </div>}
      
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={error}
      />
    </div>
  );
};
