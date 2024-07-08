import { css } from '@emotion/css';

export const getClasses = () => {
  return {
    projectCreation: css({
      width: '100%',
      height: '25%',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly',
      alignItems: 'center'
    }),
    uploadCSV: css({
      width: '100%',
      padding: '10%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }),
    uploadBtn: css({
        width: '10%',
        height: '40%',
        margin: '2%',
    }),
    switchContianer: css({
      width: '100%',
      height: '50%',
      display: 'flex',
      justifyContent: 'center',
    }),
    resultsTitle: css({
      width: '100%',
      height: '10%',
      margin: '2%',
      textDecoration: 'underline'
    }),
    resultsContainer: css({
      width: '100%',
      height: '200%',
      overflow: 'scroll',
      textAlign: "left",
      whiteSpace: "break-spaces"
    }),
  }
}