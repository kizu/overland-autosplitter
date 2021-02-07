import { css } from '@reshadow/react';

export const styles = css`
  /* Move to the main.tsx? */
  :global(html) {
    color: #FFF;
    background: #000; /* Consider transparent, for the browsersource? */
  }

  main {
    --misc-color: rgba(255,255,255,0.75);
    --font-large: 54px;
    --font-regular: 18px;
    --font-small: 14px;

    width: 280px;
    border: 1px solid var(--misc-color);
    border-radius: 3px;

    background: rgba(255,255,255,0.1);

    font: var(--font-regular)/1.5 Helvetica Neue, Arial, sans-serif;
  }

  h1,
  h2 {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 4px 8px;
    margin: 0;

    font: inherit;
  }

  h1 {
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 2px;
    padding-bottom: 0;

    & > small {
      font-size: var(--font-small);
      font-weight: normal;
      letter-spacing: 1px;
    }
  }

  h2 {
    font-size: var(--font-small);
    border-bottom: 1px solid var(--misc-color);
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

    padding: 2px 8px;

    & & {
      padding: 0 0 0 16px;
    }

    & > span + span {
      margin-left: auto;
      padding-left: 4px;
    }

    & > small {
      font-size: var(--font-small);
    }
  }

  output {
    display: flex;
    justify-content: flex-end;

    padding: 4px 8px;
    border-top: 1px solid var(--misc-color);
  }
`;
