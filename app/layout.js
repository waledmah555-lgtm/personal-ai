export const metadata = {
  title: "My Personal AI",
  description: "Personal GPT-powered assistant"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
