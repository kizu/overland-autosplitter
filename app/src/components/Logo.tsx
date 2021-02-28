/* @jsx styled.jsx */

import styled, { css } from '@reshadow/react'

const styles = css`
  h1 {
    padding: 10px 10px 0;
    margin: 0 0 1px !important;

    font-size: var(--font-large);
    letter-spacing: 0.8px;
    font-weight: var(--weight-black);
    line-height: 0.72;
    /* Makes this part draggable when frameless in Electron */
    -webkit-app-region: drag;
  }

  img {
    display: block;
    width: 100%;
    pointer-events: none;
  }

`;

export const Logo = ({ buildNumber, ...props }: React.PropsWithChildren<{ buildNumber?: number }>) => styled(styles)(
  <h1 {...props} title={`Overland build №${buildNumber}`}>
    <img src="../logo.png" alt="Overland" />
  </h1>
);
