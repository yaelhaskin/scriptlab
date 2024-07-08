import { SetStateAction } from "react";
import { SelectOption } from "../DropdownSelectBox/types";

export type Cloning<> = {
    setCloneFromGroup: (cloneFromGroup: SetStateAction<SelectOption[]>) => void;
    setCloneFromProject: (cloneFromProject: SetStateAction<SelectOption[]>) => void;
  };
  