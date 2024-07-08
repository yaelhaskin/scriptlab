import { css } from '@emotion/css';

export const getClasses = () => {
  return {
    frame: css({
			display: 'flex',
			width: '100vw',
			height: '100vh',
			alignItems: 'center',
			justifyContent: 'center',
    }),
		mainContent: css({
			padding: '2%',
			width: '80%',
			height: '70%',
      borderRadius: '30px',
		}),
    form: css({
      width: '100%',
      height: '100%',
			justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
			padding: '2%',
			boxSizing: 'border-box',
			display: 'flex',
      borderRadius: '30px',
    }),
    textField: css({
      width: '30%',
      height: '10%',
    }),
    loginButton: css({
      width: '30%',
      height: '10%',
    }),
  }
}