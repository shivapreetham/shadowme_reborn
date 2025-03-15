// import HomeBtn from "@/components/home&anonymous/HomeBtn"

export const metadata = {
  title: 'shatterbox',
  description: 'so whom do you trust?!!!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div>
        {/* <HomeBtn /> */}
        {children}
      </div>
  )
}
