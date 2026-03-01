import { TabBar } from '@/components/navigation/TabBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg-primary">
      <main className="pb-tab-bar">{children}</main>
      <TabBar />
    </div>
  )
}
