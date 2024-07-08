import { FC, useState } from 'react';
import { getClasses } from "./styles";
import { Button, Snackbar } from '@mui/material';

import { SelectOption } from "../DropdownSelectBox/types.ts";
import DropdownSelectBox from "../DropdownSelectBox/index.ts";

import { getStudentsQuery } from "./hooks/useStudentsQuery.ts";
import { passwordMutation } from './hooks/usePasswordReset.ts';
import { resultsObj } from '../ProjectCreation/types.ts';

export const ResetPassword: FC = () => {
  const { data: users, isFetching: isUsersLoading } = getStudentsQuery();
  const { mutate: resetPassword, data: resultsData, status: resultsStatus } = passwordMutation(); 
 
  const [selectedUsers, setSelectedUsers] = useState<SelectOption[]>([]);  
  
  const [error, setError] = useState<string | null>(null);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);

  const classes = getClasses();

  const handleResetPassword = async() => {
    if (selectedUsers.length > 0) {
      const userArray = selectedUsers;
      
      resetPassword(
        userArray.map((user: SelectOption) => user.username ? user.username : undefined)
      );    
    } else {
      setError('Please fill out all the information');
      setSnackbarOpen(true);
    }
  };

  const resultElements = (results: resultsObj[]) => {
    return results.map((obj: resultsObj) => ( <div key={obj.Project}> Username: {obj.User}, Result: {obj.Result}, New Password: {obj.Password} </div> ))
  }
  
  return(
    <div className={classes.ResetPassword}>
      <div>
        :בחרו את המשתמש שתרצו לאפס לו את הסיסמה
        <DropdownSelectBox
          options={!isUsersLoading ? users.map((user: { user_name: string; user_id: number, username: string;}) => ({
              key: user.user_name,
              id: user.user_id,
              name: user.user_name,
              username: user.username,
            })
          )
          : [{name: "Loading...", id: 0}]
          } 
          multiple={true}
          onChange={setSelectedUsers} 
        />
      </div>

      <Button className={classes.resetBtn} onClick={handleResetPassword}> Reset Password </Button>

      <div className={classes.resultsTitle}>results:</div>
      {<div className={classes.resultsContainer}> 
        {resultsStatus === "pending" ? "Pending..." : (resultsStatus === "success" && (resultElements(resultsData.data)))}
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
