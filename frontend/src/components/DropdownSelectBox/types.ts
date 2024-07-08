export type SelectOption = {
  id: number;
  key: string;
  name: string;
  username?: string;
}

export type GroupListProps<T extends SelectOption> = {
  options:  T[];
  multiple: boolean;
  onChange: (value: T[]) => void;
  selectedValue? : T | T[]
};