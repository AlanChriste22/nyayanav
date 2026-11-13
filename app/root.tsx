import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router"

import "./app.css"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>LexIndia — AI Legal Precedent & Memo Assistant</title>
        <meta
          name="description"
          content="Agentic AI Precedent Research, Dual-Model FAISS Vector Retrieval (InLegalBERT vs MiniLM), Reasoning Pattern Extraction, and Memorandum Drafting on the Indian Legal Documents Corpus (ILDC)."
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-[#1D4ED8] selection:text-white">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "System Error"
  let details = "An unexpected error occurred in the legal navigator."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested legal resource could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-6 pt-16">
      <h1 className="text-lg font-bold">{message}</h1>
      <p className="mt-2 text-xs text-muted-foreground">{details}</p>
      {stack && (
        <pre className="mt-4 w-full overflow-x-auto border border-border p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
