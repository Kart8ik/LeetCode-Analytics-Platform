import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, Inbox, Calendar, Search, Settings } from "lucide-react"
import LogoIconBlackbg from "@/assets/images/icons/logo-icon-blackbg.png"
import LogoIconWhitebg from "@/assets/images/icons/logo-icon-whitebg1.png"
import {Sun, Moon} from "lucide-react"
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  
]

export function AppSidebar() {
  const [isDark, setIsDark] = useState<boolean>(false);
    
    useEffect(() => {
        try {
            const stored = localStorage.getItem("theme");
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const initial = stored ? stored === "dark" : prefersDark;
            setIsDark(initial);
            if (initial) document.documentElement.classList.add("dark");
            else document.documentElement.classList.remove("dark");
        } catch {}
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        try {
            localStorage.setItem("theme", next ? "dark" : "light");
        } catch {}
        if (next) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
    };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sidebar-header-container"><img 
            src={isDark ? LogoIconWhitebg : LogoIconBlackbg} 
              alt="LeetTrack Logo" 

              className="sidebar-logo-icon size-0.50 md:size-6 mr-2 rounded-md" 
            />
            
            LeetCode Tracker
            <Button style={{ marginLeft: "auto" }} variant={"ghost"} size="lg" onClick={toggleTheme}>{isDark ? <Sun/> : <Moon/>}</Button>

          </SidebarGroupLabel>
          <SidebarGroupContent>
            {items.map((item)=>(
              <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon/>
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>

            </SidebarMenuItem>
            ))}

          </SidebarGroupContent>
          </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}