/* @jsx styled.jsx */

import styled, { css } from '@reshadow/react'

const styles = css`
  h1 {
    margin: 0 0 1px;

    font-size: var(--font-large);
    letter-spacing: 0.8px;
    font-weight: var(--weight-black);
    line-height: 0.72;
  }

  img {
    display: block;
    width: 100%;
  }

`;

export const Logo: React.FunctionComponent = props => styled(styles)(
  <h1 {...props}>
    <img src="/logo.png" alt="Overland" />
  </h1>
);
