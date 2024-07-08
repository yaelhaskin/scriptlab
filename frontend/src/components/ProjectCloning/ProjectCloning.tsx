import { FC, useEffect, useState } from "react";
import { getClasses } from "./styles";
import DropdownSelectBox from "../DropdownSelectBox/index.ts";
import { SelectOption } from "../DropdownSelectBox/types.ts";
import { Cloning } from "./types.ts";
import { getAllGroupsQuery } from "../ProjectCreation/hooks/useAllGroupsQuery.ts";
import { getProjectsMutation } from "../ProjectCreation/hooks/useProjectsQuery.ts";

export const ProjectCloning: FC<Cloning> = ({
  setCloneFromGroup,
  setCloneFromProject,
  }) => {
    const {data: groups, isFetching: isGroupsLoading} = getAllGroupsQuery();
    const { mutate: getProjects, data: projects } = getProjectsMutation();    
    
    const [selectedGroup, setSelectedGroup] = useState<SelectOption[]>([]);

    const classes = getClasses();

  useEffect(() => {    
    selectedGroup.length > 0 ? getProjects({group_ids: [selectedGroup[0].id]}) : null;
    setCloneFromGroup(selectedGroup)
  }, [selectedGroup])

  return (
    <div className={classes.cloning}>
      <div>
      :בחרו את הקבוצה בה נמצא הפרוייקט שתרצו לשכפל
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
      :בחרו את הפרוייקט שתרצו לשכפל
        <DropdownSelectBox 
          options={projects ? projects.map((project: { project: string; project_id: number }) => ({
            id: project.project_id,
            name: project.project
          }))
          : [{name: "Loading...", id: 0}] 
          } 
          onChange={setCloneFromProject} 
          multiple={false}
        ></DropdownSelectBox>
      </div>
    </div>
  );
};

