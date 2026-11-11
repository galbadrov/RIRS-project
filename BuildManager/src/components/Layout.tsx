import AppSidebar from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Layout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className='bg-slate-100'>
          <div className='mx-auto w-full max-w-7xl p-4 sm:p-6'>
            <SidebarTrigger className='mb-6 md:hidden' />
            <h1 className='text-2xl font-bold text-slate-900'>
              Nadzorna plošča
            </h1>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
