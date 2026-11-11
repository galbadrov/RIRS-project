import { LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import buildManagerLogo from "@/public/buildmanager.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='border-b border-sidebar-border p-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='h-12 font-bold'
              size='lg'
              tooltip='BuildManager'>
              <Link to='/'>
                <img
                  src={buildManagerLogo}
                  alt=''
                  className='size-8 rounded-lg'
                />
                <span className='text-base'>BuildManager</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigacija</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/"}
                  tooltip='Nadzorna plošča'>
                  <Link to='/'>
                    <LayoutDashboard />
                    <span>Nadzorna plošča</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
