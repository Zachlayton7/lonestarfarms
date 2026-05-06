export const metadata = {
  title: "Lone Star Farms — Find Fresh Texas Produce",
  description: "Discover local farms and farmers markets across Texas. Fresh produce, straight from the source.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
