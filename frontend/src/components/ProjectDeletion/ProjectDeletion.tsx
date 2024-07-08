import { FC, useEffect, useState } from "react";
import { getClasses } from "./styles";
import { Snackbar, Button } from "@mui/material";

import DropdownSelectBox from "../DropdownSelectBox/index.ts";

import { SelectOption } from "../DropdownSelectBox/types.ts";
import { getAllGroupsQuery } from "./hooks/useAllGroupsQuery.ts";
import { getProjectsMutation } from "./hooks/useProjectsQuery.ts";
import { deleteProjectsMutation } from "./hooks/useDeleteProjects.ts";
import { resultsObj } from "../ProjectCreation/types.ts";

export const ProjectDeletion: FC = () => {
  const {data: groups, isFetching: isGroupsLoading} = getAllGroupsQuery();
  const { mutate: getProjects, data: projects } = getProjectsMutation();    
  const { mutate: deleteProjects, data: resultsData, status: resultsStatus } = deleteProjectsMutation(); 

  const [selectedGroup, setSelectedGroup] = useState<SelectOption[]>([]);
  const [chosenProjects, setChosenProjects] = useState<SelectOption[]>([] as SelectOption[]);
  
  const [error, setError] = useState<string | null>(null);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);

  const classes = getClasses();

  const handleDeleteProjects = async() => {
    if (selectedGroup.length > 0 && chosenProjects) {
      deleteProjects(
        chosenProjects.map((name) =>    
         ({project: name.name, namespace: selectedGroup[0]?.name})
        )
      );      
    } else {
      setError('Please fill out all the information');
      setSnackbarOpen(true);
    }
  };

  const resultElements = (results: resultsObj[]) => {
    return results.map((obj: resultsObj) => ( <div key={obj.Project}> Project: {obj.Project}, Result: {obj.Result} </div> ))
  }
  
  useEffect(() => {
    selectedGroup.length > 0 ? getProjects({group_ids: [selectedGroup[0].id]}) : null;
  }, [selectedGroup])
  
  return (
    <div className={classes.projectDeletion}>
      <div>
        :בחרו את הקבוצה שממנה תרצו למחוק פרוייקטים
        <DropdownSelectBox 
          options={!isGroupsLoading ? groups.map((group: { group_path: string; group_id: number }) => ({
            id: group.group_id,
            name: group.group_path,
          }))
          : [{name: "Loading...", id: 0}]
          
          } 
          multiple={false}
          onChange={setSelectedGroup} 
        />
      </div>
      <div>
        :בחרו את הפרוייקטים שתרצו למחוק
        <DropdownSelectBox 
          onChange={setChosenProjects}
          options={projects ? projects.map((project: { project: string; project_id: number; }) => ({
            id: project.project_id,
            name: project.project
          }))
          : [{ name: "Loading...", id: 0 }]}
          multiple={true} 
          selectedValue={chosenProjects}
        />
        {projects && <button 
          onClick={() => setChosenProjects(projects.map((project: { project: string; project_id: number; }) => ({
            id: project.project_id,
            name: project.project
            }))
          )} 
          className={classes.selectAll}>
        Select All
        </button>}
      </div>

      <Button className={classes.deleteBtn} onClick={handleDeleteProjects}> Delete </Button>

      <div className={classes.resultsTitle}>results:</div>
      {<div className={classes.resultsContainer}> 
        {resultsStatus === "pending" ? "Pending..." : (resultsStatus === "success" && (resultElements(resultsData)))}
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


