/* @jsx styled.jsx */

import styled, { css, use } from '@reshadow/react'

const styles = css`
  small {
    display: inline-block;
    position: relative;
    z-index: 1;
    vertical-align: middle;
    box-sizing: border-box;
    height: 1em;
    width: 1em;
    padding: 1px 1px 0;
    margin-top: -0.4em;
    margin-left: 0.3em;
    text-align: center;
    line-height: 1;
    font-size: 12px;
    border-radius: 50%;
    color: var(--color-bg);

    &::before {
      content: "";
      position: absolute;
      z-index: -1;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      border-radius: 50% 50% 50% 0;
      background: var(--color-main);
      transform: rotate(-45deg);

      &[children=2] {
        background: red;
      }
    }
  }
`;

export const StopsIcon: React.FunctionComponent = props => styled(styles)(
  <small {...props} />
);
