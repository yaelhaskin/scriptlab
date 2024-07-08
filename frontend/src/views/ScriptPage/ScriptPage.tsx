import { Button, ButtonGroup, Card, Container } from '@mui/material';
import { FC, useState } from 'react';
import { getClasses } from './styles';

import ProjectCreation from '../../components/ProjectCreation';
import ProjectDeletion from '../../components/ProjectDeletion';
import ResetPassword from '../../components/ResetPassword';
import UserPermissions from '../../components/UserPermissions';

export const ScriptPage: FC = () => {
  const classes = getClasses();
  const [selectedScript, setSelectedScript] = useState<string>("Project Creation");

  const componentsArray: string[] = [
      "Project Creation", 
      "User Permissons",
      "Project Deletion",
      // "Issue Creation", 
      "Reset Password"
    ];

  const componentsObj: Record<string, JSX.Element> = {
    "Project Creation": <ProjectCreation />,
    "User Permissons": <UserPermissions />,
    "Project Deletion": <ProjectDeletion />,
    // "Issue Creation": <IssueCreation />,
    "Reset Password": <ResetPassword />
  };

  return (
    <>
      <Container className={classes.frame}>
        <Card className={classes.header}>
          <ButtonGroup className={classes.buttonGroup}>
            {componentsArray.map((name: string, index: number) => {
              return <Button 
                      key={`${name}${index}`} 
                      className={`${classes.button} ${selectedScript === name && classes.clicked}`} 
                      onClick={() => setSelectedScript(name)}
                      > {name} </Button> 
            })}
          </ButtonGroup>
        </Card>
        <Card className={classes.mainContent}>
          {componentsObj[selectedScript]}
        </Card>
      </Container>
    </>
  );
};