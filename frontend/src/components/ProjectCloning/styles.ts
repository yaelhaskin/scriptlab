import { css } from '@emotion/css';

export const getClasses = () => {
  return {
    cloning: css({
      width: '100%',
      display: 'flex',
      justifyContent: 'space-evenly',
    }),
  }
}