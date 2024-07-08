import { css } from '@emotion/css';

export const getClasses = () => {
  return {
    frame: css({
			display: 'flex',
			width: '100vw',
			height: '100vh',
      flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
    }),
		mainContent: css({
			justifyContent: 'space-evenly',
			padding: '2%',
			width: '80vw',
			height: '75vh',
			boxSizing: 'border-box',
			display: 'flex',
      borderRadius: '0 0 30px 30px',
		}),
    header: css({
      display: 'flex',
      width: '80vw',
      height: '15vh',
      borderRadius: '30px 30px 0 0',
			justifyContent: 'space-evenly',
      flexDirection: 'column',
    }),
    buttonGroup: css({
      height: '100%'
    }),
    button: css({
      width: '100%',
      height: '100%',
    }),
    clicked: css({
      backgroundColor: "#FFC47E",
    })
  }
}