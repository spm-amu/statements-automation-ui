/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    let url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;

    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

export let resolveWindowHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  resolveWindowHtmlPath = (htmlFileName: string) => {
    const param = htmlFileName.split('/')[1];

    return `http://localhost:1212/#/${param}`;
  };
} else {
  resolveWindowHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}
