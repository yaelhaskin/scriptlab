import { Autocomplete, TextField } from "@mui/material";
import { FC, SyntheticEvent } from "react";
import { getClasses } from "./styles";
import { GroupListProps, SelectOption } from "./types";

export const DropdownSelectBox: FC<GroupListProps<SelectOption>> = ({
    options,
    multiple, 
    onChange,
    selectedValue
  }) => {
  const classes = getClasses();

  const handleSelect = (_: SyntheticEvent<Element, Event>, value: SelectOption | SelectOption[] | null) => {value ? onChange(Array.isArray(value) ? value: [value]): null}
  const areOptionsEqaulToValue = (option: SelectOption, value: SelectOption) => option.id === value.id
  
  return (
    <>
      <Autocomplete
        options={options as SelectOption[]}
        renderInput={(params) => (
          <TextField className={classes.textfield} {...params} />
        )}
        id="dropdown-select-box"
        getOptionLabel={(option: SelectOption) => option.name}

        isOptionEqualToValue={areOptionsEqaulToValue}
        onChange={handleSelect}
        multiple={multiple}
        value={selectedValue}
        className={classes.autocomplete}
      />
    </>
  );
};
