/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  console.log('DEV PAAATH: ')
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    let url = new URL(`http://localhost:${port}`);

    url.pathname = htmlFileName;

    console.log('PAAATH: ', url.href)

    return url.href;
  };
} else {
  console.log('PROD PAAATH: ')
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}
