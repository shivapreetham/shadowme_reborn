"use client";

import { useRef, useState, useEffect } from "react";
import { User } from "@prisma/client";
import useConversation from "@/app/hooks/useConversation";
import useRoutes from "@/app/hooks/useRoutes";
import Avatar from "@/components/chat/Avatar";
import { Plus, X } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useTheme } from "next-themes";
import SettingsModal from "./SettingsModal";

interface MobileFooterProps {
  currentUser: User;
}

const MobileFooter: React.FC<MobileFooterProps> = ({ currentUser }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { routes } = useRoutes();
  const { isOpen: isConversationOpen } = useConversation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Filter all routes
  const allRoutes = [
    ...routes.filter((route) => route.isPrimary),
    ...routes.filter((route) => route.position === "middle"),
    ...routes.filter((route) => route.position === "top"),
    ...routes.filter((route) => route.position === "bottom"),
  ];

  // Handle automatic scrolling and center item detection
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      
      // Set up auto scroll
      const handleScroll = () => {
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const containerCenter = containerRect.left + containerRect.width / 2;
          
          const items = document.querySelectorAll('.footer-item');
          let closestItem = null;
          let closestDistance = Infinity;
          
          items.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.left + itemRect.width / 2;
            const distance = Math.abs(containerCenter - itemCenter);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestItem = index;
            }
          });
          
          if (closestItem !== null && closestItem !== activeIndex) {
            setActiveIndex(closestItem);
          }
        }
      };
      
      // Snap to center when a new item is selected
      const scrollToActive = () => {
        const items = container.querySelectorAll('.footer-item');
        if (items[activeIndex]) {
          const itemWidth = items[0].getBoundingClientRect().width;
          const containerWidth = container.clientWidth;
          const scrollPosition = (activeIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
          container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
      };
      
      scrollToActive();
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex]);

  if (isConversationOpen) return null;

  const footerGradient = isDark
    ? "linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(20, 30, 50, 0.7) 100%)"
    : "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(245, 247, 250, 0.7) 100%)";

  const boxShadow = isDark
    ? "0 -2px 10px rgba(0, 0, 0, 0.25)"
    : "0 -2px 10px rgba(0, 0, 0, 0.05)";

  return (
    <>
      {/* Scrollable Footer Bar with translucent background */}
      <div
        ref={containerRef}
        className="fixed w-full bottom-0 z-40 py-3 lg:hidden transition-all duration-300 rounded-t-md"
        style={{
          background: footerGradient,
          backdropFilter: "blur(12px)",
          boxShadow: boxShadow,
          borderTop: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* Profile Avatar (Fixed left) */}
        <div className="absolute left-4 bottom-3 flex flex-col items-center justify-center cursor-pointer"
             onClick={() => setIsSettingsOpen(true)}>
          <div className="relative">
            <Avatar user={currentUser} />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
          </div>
          <span className="text-xs mt-1 truncate max-w-[4rem]">Profile</span>
        </div>

        {/* Scrollable Navigation Items */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto hide-scrollbar py-2 px-20 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {allRoutes.map((route, index) => (
            <div 
              key={route.label}
              className="footer-item snap-center flex-shrink-0 mx-4 w-16"
            >
              <FooterItem
                href={route.href}
                icon={route.icon}
                label={route.label}
                active={index === activeIndex}
                onClick={() => {
                  setActiveIndex(index);
                  if (route.onClick) route.onClick();
                }}
                isDark={isDark}
              />
            </div>
          ))}
        </div>

        {/* Style for hiding scrollbar */}
        <style jsx global>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          
          .blue-glow {
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.7);
          }
          
          .blue-glow-light {
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
          }
        `}</style>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          currentUser={currentUser}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
};

// Footer item component with less rounded borders
const FooterItem = ({
  href,
  icon: Icon,
  label,
  active,
  onClick,
  isDark,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  isDark?: boolean;
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col items-center justify-center"
    >
      <div
        className={clsx(
          "p-3 transition-all duration-300",
          active
            ? "text-primary-foreground scale-125 blue-glow" 
            : "text-foreground hover:bg-secondary/50 hover:blue-glow-light",
        )}
        style={{
          backgroundColor: active 
            ? isDark ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.8)'
            : isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.4)',
          backdropFilter: "blur(4px)",
          borderRadius: "6px",
        }}
      >
        <Icon size={active ? 24 : 20} />
      </div>
      <span className={clsx(
        "text-xs mt-1 transition-all duration-300",
        active && "text-blue-400 font-medium"
      )}>{label}</span>
    </Link>
  );
};

export default MobileFooter;