import React, {useState} from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import './PDFViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const options = {
  cMapUrl: 'cmaps/',
  standardFontDataUrl: 'standard_fonts/',
};

const PDFViewer = (props) => {
  const { pdf } = props;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  const previousPage = () => {
    changePage(-1);
  }

  const nextPage = () => {
    changePage(1);
  }

  return (
    <>
      <div className={'help-container'}>
        <p>
          Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
        </p>
        <button className={'help-btn'} type="button" disabled={pageNumber <= 1} onClick={previousPage}>
          Previous
        </button>
        <button
          className={'help-btn'}
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          Next
        </button>
      </div>
      <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess} options={options}>
        <Page pageNumber={pageNumber} />
      </Document>
    </>
  );
};

export default PDFViewer;
