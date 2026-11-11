import { LayoutDashboard, LogOut, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import buildManagerLogo from "@/public/buildmanager.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  const navigate = useNavigate();
  const isAdmin = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "null") as {
        vloga?: string;
      } | null;
      return user?.vloga === "ADMIN";
    } catch {
      return false;
    }
  })();

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

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
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/racuni"}
                    tooltip='Računi'>
                    <Link to='/racuni'>
                      <Users />
                      <span>Računi</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-sidebar-border'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip='Odjava' onClick={handleLogout}>
              <LogOut />
              <span>Odjava</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
