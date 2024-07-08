import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { FC, useMemo } from "react";
import { themePalette } from "./ThemePalette";
import { ThemeContextProps } from "./types";

export const ThemeContext: FC<ThemeContextProps> = ({ children }) => {
  const theme = useMemo( 
    () =>
    createTheme({
      palette: themePalette,
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              border: 'none',
              backgroundColor: '#FFE382',
              '&:hover': {
                border: 'none',
                color: 'black',
                backgroundColor: '#FFAD84',
              },
            }
          }
        },
        MuiInputLabel: {
          defaultProps: {
            sx: {
              fontWeight: 'normal',
              fontSize: '1em',
            },
          }
        },
        MuiSnackbarContent: {
          styleOverrides: {
            root: {
              backgroundColor: "white"
            }
          }
        },
      },
    }),
    []
  );
  return (
    <ThemeProvider theme={theme}>
      {children}
      <CssBaseline />
    </ThemeProvider>
      );
};