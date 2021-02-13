import { css } from '@reshadow/react';

export const styles = css`
  :global(html) {
    --color-main: #FAF7E5;
    --color-bg: #0C1B1E;
    --misc-color: rgba(255,255,255,0.75);

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

    color: var(--color-main);
    background: var(--color-bg); /* Consider transparent, for the browsersource? */
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
    display: flex;
    flex-direction: column;
    width: 240px;
    height: 505px;
    max-height: calc(100vh - 20px);
    margin: 10px;

    font-size: var(--font-regular);

    overflow: hidden;
    resize: both;

    /* To hide the resizer unless hovered */
    &:not(:hover):not(:active) {
      visibility: hidden;
    }
    & > * {
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
      opacity: 0.35;
    }

    & & {
      padding: 0 0 0 10px;
      font-size: var(--font-small);
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
    margin-top: auto;
  }

  button {
    all: unset;
    cursor: pointer;
  }
`;
