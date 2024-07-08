import { css } from '@emotion/css';

export const getClasses = () => {
  return {
    autocomplete: css({
      width: '100%',
      maxWidth: '45vw',
    }),
    textfield: css({
      maxHeight: '20vh',
      overflow: 'auto',
    })
  }
}