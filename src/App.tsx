import { PrForm } from '@/components/pr-form'
import { Toaster } from '@/components/ui/sonner'
import { useColorScheme, useColorSchemeClass } from '@/hooks/use-color-scheme'

export const App = () => {
  const colorScheme = useColorScheme()
  useColorSchemeClass(window.document.documentElement, colorScheme)

  return (
    <div className="flex flex-col min-h-screen py-5 md:py-10 px-5 md:px-10">
      <main className="md:container xl:max-w-5xl md:mx-auto flex-1">
        <PrForm />
      </main>
      <Toaster />
    </div>
  )
}
