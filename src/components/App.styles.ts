import { css } from '@reshadow/react';

export const styles = css`
  :global(html) {
    --color-main: #FFF7E4;
    --color-bg: #0D181C;
    --misc-color: rgba(255,255,255,0.75);

    --font-large: 48.6px;
    --font-regular: 18px;
    --font-small: 14px;

    --weight-normal: 400;
    --weight-bold: 700;
    --weight-black: 900;

    margin: 0;

    font-family: Lato, Helvetica Neue, Arial, sans-serif;
    font-weight: var(--weight-bold);
    text-transform: uppercase;
    letter-spacing: 1px;

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
    width: 280px;
    margin: 20px;

    font-size: var(--font-regular);
  }

  h1,
  h2 {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin: 0;

    font: inherit;
  }

  h1 {
    position: relative;
    font-size: var(--font-large);
    line-height: 0.7;
    padding-bottom: 0.055em;

    font-weight: var(--weight-black);
    letter-spacing: 2px;
  }

  h2 {
    position: relative;
    font-size: var(--font-small);
    font-weight: var(--weight-bold);
    padding: 5px 0;
    border-bottom: 3px solid;
    margin-bottom: 20px;
  }

  ol {
    padding: 0;
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

    & & {
      padding: 0 0 0 20px;
      font-size: var(--font-small);
    }

    & > span + span {
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

    padding: 10px 0;
    border-top: 3px solid;
  }

  aside {
    margin-top: auto;
  }
`;
