import { css } from '@emotion/css';

export const getClasses = () => {
  return {
    projectDeletion: css({
      width: '100%',
      height: '25%',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly',
      alignItems: 'center'
    }),
    selectAll: css ({
      cursor: "pointer",
    }),
    deleteBtn: css({
      width: '10%',
      height: '40%',
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