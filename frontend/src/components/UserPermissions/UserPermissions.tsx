import { Dispatch, FC, SetStateAction, useState } from 'react';
import { getClasses } from "./styles.ts";
import { Button, Snackbar } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { SelectOption } from "../DropdownSelectBox/types.ts";
import { UploadCSVFile } from './UploadCSVFile.tsx';
import DropdownSelectBox from "../DropdownSelectBox/index.ts";

import { getAllGroupsQuery } from "./hooks/useAllGroupsQuery.ts";
import { permissionsMutation } from './hooks/usePermissoins.ts';
import { CsvFileData, CsvUserData } from './types.ts';
import { resultsObj } from '../ProjectCreation/types.ts';

import examplePic from "../../assets/exampleFiles/userPermissionExample.png"

export const UserPermissions: FC = () => {
  const { data: groups, isFetching: isGroupsLoading } = getAllGroupsQuery();
  const { mutate: addPermissions, data: resultsData, status: resultsStatus } = permissionsMutation(); 

  const [csvFileData, setCsvFileData] = useState<CsvFileData>([]);
  const [csvUserData, setCsvUserData] = useState<CsvUserData>([]);
  
  const [selectedGroup, setSelectedGroup]: [SelectOption[] , Dispatch<SetStateAction<SelectOption[]>>]  = useState<SelectOption[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<SelectOption[]>([]);
  
  const [error] = useState<string | null>(null);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [showPic, setShowPic] = useState(false);

  const classes = getClasses();

  const permissions: string[] = ['guest', 'reporter', 'developer', 'maintainer', 'owner'];
  
  const handleAddPermissions = async() => {
    addPermissions({
      namespace: selectedGroup[0]?.name,
      projects: csvFileData.map((name: string, index: number) => ({project: name, permission: selectedPermission[0]?.name, users: csvUserData[index]})),
    });
  };

  const resultElements = (results: resultsObj[]) => {
    return results.map((obj: resultsObj) => ( <div key={obj.Project}> project: {obj.project}, user: {obj.username} result: {obj.result} </div> ))
  }

  return(
    <div className={classes.userPermissions}>
      <Button onClick={() => setShowPic((prev) => !prev)}><ArrowDropDownIcon style={showPic ? { transform: "rotate(180deg)"} : undefined}/>לדוגמה csv תמונת קובץ</Button>
      <UploadCSVFile setCsvFileData={setCsvFileData} setCsvUserData={setCsvUserData}/>
      <div>
        :בחרו את הקבוצה בה נמצא הפרוייקט
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

      <div>
        :בחרו את ההרשאה שתרצו להוסיף למשתמשים
        <DropdownSelectBox 
          options={permissions.map((name: string, index: number) => ({
            key: name,
            id: index,
            name: name,
          }))
        } 
        multiple={false}
        onChange={setSelectedPermission} 
        />
      </div>

      <Button className={classes.uploadBtn} onClick={handleAddPermissions}> Add Permissions </Button>
      {showPic && <img src={examplePic} alt='example'/>}

      <div className={classes.resultsTitle}>results:</div>
      {<div className={classes.resultsContainer}> 
      {resultsStatus === "pending" ? "Pending..." : (resultsStatus === "success"  && (resultElements(resultsData)))}
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
