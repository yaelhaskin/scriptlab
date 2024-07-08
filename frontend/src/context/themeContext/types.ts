declare module '@mui/material/styles' {
  interface Palette extends ThemePalette {}
}

export interface ThemePalette {
  background: {
    default: string;
  }
}

export interface ThemeContextProps {
  children: JSX.Element[] | JSX.Element;
}