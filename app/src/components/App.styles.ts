import { css } from '@reshadow/react';

export const styles = css`
  :global(html) {
    --color-light: #FAF7E5;
    --color-dark: #0C1B1E;
    --color-gold: #F79D34;
    --color-red: #F46044;
    --color-green: #8EB884;

    --color-dark-overlay: rgb(12, 27, 30, 0.8);

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
    width: 260px;
    height: 525px;
    box-sizing: content-box;
    max-height: 100vh;
    padding: 0;

    font-size: var(--font-regular);

    overflow: hidden;
    resize: both;

    &[|isElectron] {
      width: 100vw;
      height: 100vh;
      resize: none;
    }

    &:global([class]) > * {
      margin-left: 10px;
      margin-right: 10px;
    }

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
    &:not(:hover):not(:active):not([|isElectron]),
    &:not(:hover) > button {
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
      background: url(../moon.png) 0 0/contain no-repeat;
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

    /* Small timer */
    & + * {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: var(--font-small);
      opacity: var(--alpha-inactive);
    }
  }

  aside {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0 !important;
    background: var(--color-dark-overlay);
    z-index: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    & > * {
      margin: 0;
    }

    &:not([|hasSettings]) {
      display: none;
    }

    & > button:global(:last-child) {
      margin-top: auto;
    }

    & > Logo {
      margin: -10px -10px 0 !important;
    }
  }

  button {
    all: unset;
    cursor: pointer;

    &:hover {
      opacity: 1 !important;
    }
  }

  label[|isOffset] {
    display: flex;
    font-size: var(--font-small);

    & > input {
      width: 8ch;
      margin-left: auto;
    }
  }
`;
