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
  History,
  Settings,
  TrendingUp,
  Users,
  Package,
  Receipt,
  Lock,
  Unlock,
  Truck,
  Wallet,
  LogOut,
  UserRound,
} from "lucide-react";
import useUserStore from "@/stores/user-store";
import useCashSessionStore from "@/stores/cash-session-store";
import { money } from "@/components/cash-session";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  transactionHistory: Array<{ total: number }>;
  onOpenCash: () => void;
  onCloseCash: () => void;
  currency?: string;
}

const ROLE_LABELS: Record<string, string> = { admin: "Administrateur", manager: "Responsable", cashier: "Caissier" };

export function Sidebar({
  currentView,
  onViewChange,
  transactionHistory,
  onOpenCash,
  onCloseCash,
  currency,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useUserStore((s) => s.currentUser);
  const logout = useUserStore((s) => s.logout);
  const session = useCashSessionStore((s) => s.session);

  const menuItems = [
    { id: "pos", label: "Point de vente", icon: Home, badge: null },
    { id: "cash", label: "Caisse", icon: Wallet, badge: null },
    { id: "livraison", label: "Livraisons", icon: Truck, badge: null },
    { id: "history", label: "Transactions du jour", icon: History, badge: transactionHistory.length },
    { id: "receipts", label: "Reçus", icon: Receipt, badge: null },
    { id: "customers", label: "Clients", icon: Users, badge: null },
    { id: "inventory", label: "Inventaire", icon: Package, badge: null },
    { id: "reports", label: "Rapports", icon: TrendingUp, badge: null },
    { id: "settings", label: "Paramètres", icon: Settings, badge: null },
  ];

  const todaysRevenue = transactionHistory.reduce((sum, t) => sum + t.total, 0);
  const cur = session?.currency ?? currency;

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
        <div className="p-4 h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className={`mb-4 ${isCollapsed ? "lg:text-center" : ""}`}>
            <div className="flex items-center justify-between">
              <h2 className={`font-bold text-lg ${isCollapsed ? "lg:hidden" : ""}`}>POS System</h2>
              <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={() => setIsCollapsed(!isCollapsed)}>
                <Menu className="h-4 w-4" />
              </Button>
            </div>
            {!isCollapsed && <p className="text-sm text-muted-foreground mt-1">Caisse connectée à Sage X3</p>}
          </div>

          {/* Signed-in user */}
          {user && !isCollapsed && (
            <Card className="mb-3">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserRound className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{user.code} · {ROLE_LABELS[user.role] ?? user.role}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1 h-7" onClick={logout} title="Fermer la session">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cash Drawer Status */}
          <Card className={`mb-3 transition-all duration-200 hover:shadow-md ${isCollapsed ? "lg:hidden" : ""}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Caisse</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={session ? onCloseCash : onOpenCash}
                  className={`p-1 transition-colors duration-200 ${session ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}`}
                  title={session ? "Fermer la caisse" : "Ouvrir la caisse"}
                >
                  {session ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Statut :</span>
                  <Badge variant={session ? "default" : "secondary"} className="text-xs">{session ? "Ouverte" : "Fermée"}</Badge>
                </div>
                {session ? (
                  <>
                    <div className="flex justify-between text-xs"><span>Fond :</span><span className="font-mono">{money(session.opening_amount, cur)}</span></div>
                    <div className="flex justify-between text-xs"><span>Espèces attendues :</span><span className="font-mono">{money(session.expected_amount, cur)}</span></div>
                    <div className="text-[10px] text-muted-foreground">Ouverte {new Date(session.opened_at).toLocaleTimeString()} par {session.user_code}</div>
                  </>
                ) : (
                  <Button size="sm" variant="outline" className="w-full mt-1" onClick={onOpenCash}>
                    <Unlock className="h-3 w-3 mr-1" /> Ouvrir la caisse
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {!isCollapsed && (
            <Card className="mb-4 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-3">
                <h3 className="text-sm font-medium mb-2">Aujourd'hui</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>Transactions :</span><span className="font-medium">{transactionHistory.length}</span></div>
                  <div className="flex justify-between"><span>Encaissé :</span><span className="font-medium text-green-600 font-mono">{money(todaysRevenue, cur)}</span></div>
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
                      <Icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge !== null && item.badge > 0 && (
                            <Badge variant="secondary" className="ml-auto text-xs">{item.badge}</Badge>
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
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setIsCollapsed(true)} />
      )}
    </>
  );
}
