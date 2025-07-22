export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
          }
          
          html,
          body {
            max-width: 100vw;
            overflow-x: hidden;
          }
          
          body {
            color: rgb(var(--foreground-rgb));
            background: linear-gradient(
                to bottom,
                transparent,
                rgb(var(--background-end-rgb))
              )
              rgb(var(--background-start-rgb));
          }
          
          a {
            color: inherit;
            text-decoration: none;
          }
          
          @media (prefers-color-scheme: dark) {
            html {
              color-scheme: dark;
            }
          }
          
          /* Tailwind-like utility classes */
          .min-h-screen { min-height: 100vh; }
          .bg-green-50 { background-color: #f0fdf4; }
          .bg-white { background-color: white; }
          .bg-green-200 { background-color: #bbf7d0; }
          .bg-green-400 { background-color: #4ade80; }
          .bg-green-600 { background-color: #16a34a; }
          .bg-green-800 { background-color: #166534; }
          .bg-gray-800 { background-color: #1f2937; }
          .text-white { color: white; }
          .text-green-600 { color: #16a34a; }
          .text-green-800 { color: #166534; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-700 { color: #374151; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-300 { color: #d1d5db; }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
          .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
          .rounded-lg { border-radius: 0.5rem; }
          .rounded { border-radius: 0.25rem; }
          .overflow-hidden { overflow: hidden; }
          .max-w-7xl { max-width: 80rem; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .px-8 { padding-left: 2rem; padding-right: 2rem; }
          .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
          .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
          .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
          .py-24 { padding-top: 6rem; padding-bottom: 6rem; }
          .p-6 { padding: 1.5rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .px-8 { padding-left: 2rem; padding-right: 2rem; }
          .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .pt-8 { padding-top: 2rem; }
          .mt-8 { margin-top: 2rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-8 { margin-bottom: 2rem; }
          .mb-12 { margin-bottom: 3rem; }
          .h-48 { height: 12rem; }
          .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
          .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
          .text-5xl { font-size: 3rem; line-height: 1; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .flex { display: flex; }
          .hidden { display: none; }
          .grid { display: grid; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .text-center { text-align: center; }
          .space-x-8 > * + * { margin-left: 2rem; }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .gap-8 { gap: 2rem; }
          .border-t { border-top-width: 1px; }
          .border-gray-700 { border-color: #374151; }
          .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
          .from-green-400 { --tw-gradient-from: #4ade80; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(74 222 128 / 0)); }
          .to-green-600 { --tw-gradient-to: #16a34a; }
          .hover\\:bg-gray-100:hover { background-color: #f3f4f6; }
          .hover\\:bg-green-700:hover { background-color: #15803d; }
          .hover\\:text-green-600:hover { color: #16a34a; }
          .hover\\:text-white:hover { color: white; }
          .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
          
          @media (min-width: 768px) {
            .md\\:flex { display: flex; }
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          }
          
          @media (min-width: 1024px) {
            .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
            .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
} 