export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>The Plant Store</title>
        <meta name="description" content="Beautiful plants for your home and garden" />
      </head>
      <body>{children}</body>
    </html>
  )
} 