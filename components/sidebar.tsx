"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  X,
  Home,
  BarChart3,
  History,
  Settings,
  TrendingUp,
  Users,
  Package,
  Receipt,
  Lock,
  Unlock,
} from "lucide-react";
import type { Transaction } from "@/types/pos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  transactionHistory: Transaction[];
  cashDrawerOpen: boolean;
  onToggleCashDrawer: () => void;
  cashDrawerAmount: number;
}

export function Sidebar({
  currentView,
  onViewChange,
  transactionHistory,
  cashDrawerOpen,
  onToggleCashDrawer,
  cashDrawerAmount,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "pos", label: "Point of Sale", icon: Home, badge: null },
    { id: "dashboard", label: "Dashboard", icon: BarChart3, badge: null },
    {
      id: "history",
      label: "Transaction History",
      icon: History,
      badge: transactionHistory.length,
    },
    { id: "customers", label: "Customers", icon: Users, badge: null },
    { id: "inventory", label: "Inventory", icon: Package, badge: null },
    { id: "reports", label: "Reports", icon: TrendingUp, badge: null },
    { id: "receipts", label: "Receipts", icon: Receipt, badge: null },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
  ];

  const todaysRevenue = transactionHistory.reduce((sum, t) => sum + t.total, 0);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-transparent"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed left-0 top-0 h-full bg-background border-r z-40 transition-all duration-300 ease-in-out
        ${
          isCollapsed
            ? "-translate-x-full lg:translate-x-0 lg:w-16"
            : "translate-x-0 w-64"
        }
        lg:relative lg:translate-x-0
      `}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className={`mb-6 ${isCollapsed ? "lg:text-center" : ""}`}>
            <div className="flex items-center justify-between">
              <h2
                className={`font-bold text-lg ${
                  isCollapsed ? "lg:hidden" : ""
                }`}
              >
                POS System
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
            {!isCollapsed && (
              <p className="text-sm text-muted-foreground mt-1">
                Retail Management
              </p>
            )}
          </div>

          {/* Cash Drawer Status */}
          <Card
            className={`mb-4 transition-all duration-200 hover:shadow-md ${
              isCollapsed ? "lg:hidden" : ""
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cash Drawer</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCashDrawer}
                  className={`p-1 transition-colors duration-200 ${
                    cashDrawerOpen
                      ? "text-green-600 hover:text-green-700"
                      : "text-red-600 hover:text-red-700"
                  }`}
                >
                  {cashDrawerOpen ? (
                    <Unlock className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Status:</span>
                  <Badge
                    variant={cashDrawerOpen ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {cashDrawerOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Amount:</span>
                  <span className="font-mono">
                    ${cashDrawerAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {!isCollapsed && (
            <Card className="mb-4 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-3">
                <h3 className="text-sm font-medium mb-2">Today's Summary</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Transactions:</span>
                    <span className="font-medium">
                      {transactionHistory.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium text-green-600">
                      ${todaysRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator className="mb-4" />

          {/* Navigation Menu */}
          <nav className="flex-1">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <li key={item.id}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`
                        w-full justify-start transition-all duration-200 hover:scale-105
                        ${isCollapsed ? "lg:justify-center lg:px-2" : ""}
                        ${isActive ? "shadow-md" : ""}
                      `}
                      onClick={() => {
                        onViewChange(item.id);
                        if (window.innerWidth < 1024) setIsCollapsed(true);
                      }}
                    >
                      <Icon
                        className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge !== null && item.badge > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="mt-auto pt-4 border-t">
              <div className="text-xs text-muted-foreground text-center">
                <p>POS System v2.0</p>
                <p>© 2025 Waza Solutions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
