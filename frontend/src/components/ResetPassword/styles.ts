import { css } from '@emotion/css';

export const getClasses = () => {
  return {
    ResetPassword: css({
      width: '100%',
      height: '40%',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly',
      alignItems: 'center'
    }),
    resetBtn: css({
      width: '20%',
      height: '25%',
      margin: '2%',
    }),
    resultsTitle: css({
      width: '100%',
      height: '10%',
      margin: '2%',
      textDecoration: 'underline'
    }),
    resultsContainer: css({
      width: '100%',
      height: '150%',
      overflow: 'scroll',
      textAlign: "left",
      whiteSpace: "break-spaces"
    }),
  }
}