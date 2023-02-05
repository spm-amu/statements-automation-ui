import { createRoot } from 'react-dom/client';
import App from './App';
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "https://af5dee7c51af426fa760bc8b2dd64c76@o4504592766664704.ingest.sentry.io/4504592772235264",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
