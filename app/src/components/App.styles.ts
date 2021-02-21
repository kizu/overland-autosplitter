import { css } from '@reshadow/react';

export const styles = css`
  :global(html) {
    --color-light: #FAF7E5;
    --color-dark: #0C1B1E;
    --color-gold: #F79D34;
    --color-red: #F46044;
    --color-green: #8EB884;

    --alpha-disabled: 0.35;
    --alpha-inactive: 0.5;

    --font-large: 50px;
    --font-regular: 18px;
    --font-small: 14px;

    --weight-normal: 400;
    --weight-bold: 700;
    --weight-black: 900;

    margin: 0;

    font-family: Lato, Helvetica Neue, Arial, sans-serif;
    font-family: Nunito Sans, Helvetica Neue, Arial, sans-serif;
    font-weight: var(--weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.2px;

    color: var(--color-light);
    background: var(--color-dark); /* Consider transparent, for the browsersource? */
  }

  :global(html, body) {
    padding: 0;
    margin: 0;
  }

  [|Root] {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    width: 240px;
    height: 505px;
    box-sizing: content-box;
    max-height: calc(100vh - 20px);
    padding: 10px;

    font-size: var(--font-regular);

    overflow: hidden;
    resize: both;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
    }

    /* To hide the resizer unless hovered */
    &:not(:hover):not(:active) {
      visibility: hidden;
    }

    & > *,
    &::before {
      visibility: visible;
    }
  }

  main > ol {
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    justify-content: flex-end;
    overflow: hidden;
  }

  main > button {
    position: absolute;
    padding: 10px;
    bottom: 0;
    left: 0;
  }

  h2 {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin: 0;

    font: inherit;
    position: relative;
    font-size: var(--font-small);
    font-weight: var(--weight-bold);
    padding: 5px 0;
    border-bottom: 3px solid;
    margin-bottom: 10px;
  }

  ol {
    padding: 0 0 5px;
    margin: 0;

    li > & {
      width: 100%;
    }
  }

  li {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;

    padding: 5px 0;

    & + & {
      padding-top: 0;
    }

    &[|isDisabled] {
      opacity: var(--alpha-disabled);
    }

    &[|isFinished] > *:not(ol) {
      opacity: var(--alpha-inactive);
    }

    & & {
      padding: 0 0 0 10px;
      font-size: var(--font-small);
    }

    &[|isNight] > span::after {
      content: "";
      display: inline-block;
      vertical-align: middle;
      font-size: 0.65em;
      width: 1em;
      height: 1.375em;
      margin-top: -0.3em;
      margin-left: 0.5em;
      background: url(/moon.png) 0 0/contain no-repeat;
    }

    /* Reshadow has a bug where we can't target a React.memo-wrapped elements */
    & > span + *,
    & > button + * {
      margin-left: auto;
      padding-left: 4px;
    }

    & small {
      font-size: var(--font-small);
      font-weight: var(--weight-normal);
    }
  }

  output {
    display: flex;
    justify-content: flex-end;

    margin-top: auto;
    padding: 5px 0;
    border-top: 3px solid;
  }

  aside {
    padding: 10px;
    margin-top: auto;
  }

  button {
    all: unset;
    cursor: pointer;

    &:hover {
      opacity: 1 !important;
    }
  }
`;
