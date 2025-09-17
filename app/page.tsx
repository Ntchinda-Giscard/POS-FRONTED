"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchProducts,
  fetchCustomers,
  createSalesOrder,
  processPayment,
  finalizeOrder,
  searchProducts,
} from "@/lib/api";
import {
  createTransaction,
  calculateTransactionTotals,
} from "@/lib/transaction-utils";
import { CustomerSelector } from "@/components/customer-selector";
import { TransactionConfirmation } from "@/components/transaction-confirmation";
import { Sidebar } from "@/components/sidebar";
import { CashDrawerManager } from "@/components/cash-drawer-manager";
import { SettingsPanel } from "@/components/settings-panel";
import { ReceiptGenerator } from "@/components/receipt-generator";
import type {
  Product,
  TransactionItem,
  Customer,
  Transaction,
} from "@/types/pos";
import {
  ShoppingCart,
  Search,
  CreditCard,
  DollarSign,
  Package,
  AlertTriangle,
  Smartphone,
  Sparkles,
  Moon,
  Sun,
  X,
  Loader2,
  Minus,
  Plus,
  Menu,
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTheme } from "next-themes";
import HeaderCommande from "@/components/header-commande";
import GestionCommande from "@/components/gestion";
import Livraison from "@/components/livraison";
import Facturation from "@/components/facturation";
import useSiteVenteStore from "@/stores/site-store";
import SiteExpedition from "@/components/select-site-epedition";
import useSiteExpeditionStore from "@/stores/expedition-store";

const tabs = [
  {
    name: "En-tête",
    value: "header",
    content: <HeaderCommande />,
  },
  {
    name: "Gestion",
    value: "gestion",
    content: <GestionCommande />,
  },
  {
    name: "Livraison",
    value: "livraison",
    content: <Livraison />,
  },
  {
    name: "Facturation",
    value: "facturation",
    content: <Facturation />,
  },
];

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function POSApp() {
  const [currentView, setCurrentView] = useState("pos");
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >();
  const [completedTransaction, setCompletedTransaction] =
    useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>(
    []
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});
  const [showQuantityControls, setShowQuantityControls] = useState<
    Record<string, boolean>
  >({});
  const [cashDrawerOpen, setCashDrawerOpen] = useState(false);
  const [cashDrawerAmount, setCashDrawerAmount] = useState(200.0);
  const [openingAmount, setOpeningAmount] = useState(200.0);
  const [cashTransactions, setCashTransactions] = useState<
    Array<{
      id: string;
      type: "sale" | "refund" | "cash_in" | "cash_out";
      amount: number;
      timestamp: Date;
      description: string;
    }>
  >([]);

  const [showReceiptGenerator, setShowReceiptGenerator] = useState(false);

  const siteExoeditionCode = useSiteExpeditionStore(
    (state) => state.selectedadressExpeditionCode
  );

  useEffect(() => {
    const loadInitialData = async () => {
      console.log("[v0] Loading initial data from API...");

      const productsResponse = await fetchProducts(siteExoeditionCode);
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data);
        console.log("[v0] Products loaded:", productsResponse.data.length);
      } else {
        setApiError(productsResponse.error || "Failed to load products");
        console.error("[v0] Error loading products:", productsResponse.error);
      }
      setIsLoadingProducts(false);

      const customersResponse = await fetchCustomers();
      if (customersResponse.success && customersResponse.data) {
        setCustomers(customersResponse.data);
        console.log("[v0] Customers loaded:", customersResponse.data.length);
      } else {
        console.error("[v0] Error loading customers:", customersResponse.error);
      }
      setIsLoadingCustomers(false);
    };

    loadInitialData();
  }, [siteExoeditionCode]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim()) {
        console.log("[v0] Searching products for:", searchTerm);
        const searchResponse = await searchProducts(
          siteExoeditionCode,
          searchTerm
        );
        if (searchResponse.success && searchResponse.data) {
          setProducts(searchResponse.data);
        }
      } else {
        const productsResponse = await fetchProducts(siteExoeditionCode);
        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data);
        }
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const categories = [
    "all",
    ...Array.from(
      new Set(products.map((p: { categorie: any }) => p.categorie))
    ),
  ];

  const filteredProducts = products.filter((product: { categorie: any }) => {
    const matchesCategory =
      selectedCategory === "all" || product.categorie === selectedCategory;
    return matchesCategory;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
        color: "text-destructive",
      };
    if (stock <= 10)
      return {
        label: "Low Stock",
        variant: "secondary" as const,
        color: "text-orange-600",
      };
    return {
      label: "In Stock",
      variant: "default" as const,
      color: "text-green-600",
    };
  };

  const addToCart = (product: Product) => {
    const quantity = productQuantities[product.item_code] || 1;

    const button = document.querySelector(
      `[data-product-id="${product.item_code}"]`
    );
    if (button) {
      button.classList.add("animate-bounce");
      setTimeout(() => button.classList.remove("animate-bounce"), 600);
    }

    setShowQuantityControls((prev) => ({
      ...prev,
      [product.item_code]: true,
    }));

    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.productId === product.item_code
      );
      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.item_code
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.item_code,
          product,
          quantity,
          unitPrice: product.base_price,
          totalPrice: product.base_price * quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setProductQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        return newQuantities;
      });
      setShowQuantityControls((prev) => ({
        ...prev,
        [productId]: false,
      }));
      return;
    }

    setProductQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, quantity),
    }));
  };

  const processTransaction = async (
    paymentMethod: "cash" | "card" | "digital"
  ) => {
    if (cart.length === 0) return;

    setIsProcessing(true);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const transaction = {
      id: `txn-${Date.now()}`,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.totalPrice, 0),
      paymentMethod,
      timestamp: new Date(),
      status: "completed",
    };

    setTransactionHistory((prev) => [transaction, ...prev]);
    clearCart();
    setIsCartOpen(false);
    setIsProcessing(false);
  };

  const handlePrintReceipt = () => {
    console.log(
      "[v0] Print receipt clicked, completedTransaction:",
      completedTransaction
    );
    if (!completedTransaction) {
      console.log("[v0] No completed transaction available for receipt");
      return;
    }
    console.log("[v0] Opening receipt generator");
    setShowReceiptGenerator(true);
  };

  const { subtotal, tax, total } = calculateTransactionTotals(cart);
  const { theme, setTheme } = useTheme();

  const renderCurrentView = () => {
    switch (currentView) {
      case "cash-drawer":
        return (
          <CashDrawerManager
            isOpen={cashDrawerOpen}
            currentAmount={cashDrawerAmount}
            openingAmount={openingAmount}
            onToggle={() => setCashDrawerOpen(!cashDrawerOpen)}
            onAmountChange={setCashDrawerAmount}
            onSetOpeningAmount={setOpeningAmount}
            transactions={cashTransactions}
          />
        );
      case "settings":
        return <SettingsPanel />;
      case "dashboard":
        return (
          <div className="space-y-6">
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Sales Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Dashboard Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting features
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "history":
        return (
          <div className="space-y-6">
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-muted-foreground">
                      Start making sales to see transaction history
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactionHistory.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              Transaction #{transaction.id.slice(-6)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.timestamp.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              ${transaction.total.toFixed(2)}
                            </div>
                            <Badge variant="outline">
                              {transaction.paymentMethod}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {apiError && (
              <Card className="border-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">API Error:</span>
                    <span>{apiError}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setApiError(null)}
                      className="ml-auto"
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="transition-all duration-200 hover:shadow-lg overflow-y-scroll h-screen">
              <CardHeader>
                <CardTitle className="flex flex-col items-start gap-2">
                  {/* Tabs */}
                  <Tabs
                    defaultValue={tabs[0].value}
                    className="max-w-xs w-full"
                  >
                    <TabsList className="p-1 h-auto bg-background gap-1 border">
                      {tabs.map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <code className="text-[13px]">{tab.name}</code>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {tabs.map((tab) => (
                      <TabsContent key={tab.value} value={tab.value}>
                        <div className=" flex items-center justify-between border gap-2 rounded-md px-4 py-4 w-fit">
                          {tab.content}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    <p>Product Catalog</p>
                  </div>
                  {isLoadingProducts && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <div className="ml-auto">
                    <Button
                      onClick={() => setIsCartOpen(true)}
                      className="relative transition-all duration-200 hover:scale-105"
                      variant={cart.length > 0 ? "default" : "outline"}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart ({cart.length})
                      {cart.length > 0 && (
                        <div className="absolute -top-1 -right-1">
                          <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
                        </div>
                      )}
                    </Button>
                  </div>
                </CardTitle>
                <div className="flex flex-col gap-4 relative">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products or scan barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 transition-all duration-200 focus:ring-2"
                    />
                  </div>
                  <SiteExpedition />
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize transition-all duration-200 hover:scale-105"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{filteredProducts.length} products found</span>
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="h-auto p-1"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">
                      Loading products...
                    </h3>
                    <p className="text-muted-foreground">
                      Fetching product catalog from API
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      return (
                        <Card
                          key={product.item_code}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            product.stock === 0
                              ? "opacity-60"
                              : "hover:scale-[1.02] hover:-translate-y-1"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="relative mb-3">
                              <Image
                                src={
                                  product.image ||
                                  "/placeholder.svg?height=120&width=120&query=product"
                                }
                                alt={product.describtion}
                                width={120}
                                height={120}
                                className="w-full h-24 object-cover rounded-md bg-muted transition-transform duration-200 hover:scale-105"
                              />
                              {product.stock <= 10 && product.stock > 0 && (
                                <div className="absolute top-2 right-2 animate-pulse">
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-sm leading-tight">
                                  {product.describtion}
                                </h3>
                                <Badge
                                  variant={stockStatus.variant}
                                  className="ml-2 text-xs"
                                >
                                  {product.stock}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {product.categorie}
                                </span>
                                <span
                                  className={`text-xs font-medium ${stockStatus.color}`}
                                >
                                  {stockStatus.label}
                                </span>
                              </div>

                              <div className="flex justify-between items-center pt-2">
                                <span className="text-lg font-bold text-primary">
                                  ${product.base_price.toFixed(2)}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(product)}
                                  disabled={product.stock === 0}
                                  className="min-w-[60px] transition-all duration-200 hover:scale-105"
                                  data-product-id={product.item_code}
                                >
                                  {product.stock === 0 ? "Sold Out" : "Add"}
                                </Button>
                              </div>

                              {product.barcode && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  {product.barcode}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {!isLoadingProducts && filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No products found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No products available in this category"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        transactionHistory={transactionHistory}
        cashDrawerOpen={cashDrawerOpen}
        onToggleCashDrawer={() => setCashDrawerOpen(!cashDrawerOpen)}
        cashDrawerAmount={cashDrawerAmount}
      />

      <div className="flex-1 p-4 lg:p-6 lg:ml-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 ml-0 lg:ml-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                {currentView === "pos"
                  ? "Point of Sale"
                  : currentView === "dashboard"
                  ? "Sales Dashboard"
                  : currentView === "history"
                  ? "Transaction History"
                  : currentView === "cash-drawer"
                  ? "Cash Drawer"
                  : currentView === "settings"
                  ? "Settings"
                  : "POS System"}
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="transition-all duration-200 hover:scale-105"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between flex-1">
              <p className="text-muted-foreground">
                {currentView === "pos"
                  ? "Modern retail management system"
                  : currentView === "dashboard"
                  ? "Analytics and insights"
                  : currentView === "history"
                  ? "View all transactions"
                  : currentView === "cash-drawer"
                  ? "Manage cash drawer operations"
                  : currentView === "settings"
                  ? "Configure system settings and preferences"
                  : "Professional point of sale system"}
              </p>
              {transactionHistory.length > 0 && currentView === "pos" && (
                <div className="text-sm text-muted-foreground">
                  Today's transactions: {transactionHistory.length} | Total: $
                  {transactionHistory
                    .reduce((sum, t) => sum + t.total, 0)
                    .toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {renderCurrentView()}

          <Dialog open={isCartOpen} onOpenChange={() => {}}>
            <DialogContent
              className="max-w-md max-h-[90vh] overflow-hidden"
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({cart.length})
                    {cart.length > 0 && (
                      <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCartOpen(false)}
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 max-h-[calc(90vh-120px)]">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Cart is empty</p>
                    <p className="text-sm text-muted-foreground">
                      Add products to get started
                    </p>
                  </div>
                ) : (
                  <>
                    <CustomerSelector
                      selectedCustomer={selectedCustomer}
                      onCustomerSelect={setSelectedCustomer}
                    />

                    <Separator />

                    <div className="max-h-64 space-y-3">
                      {cart.map((item, index) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 transition-all duration-200 hover:bg-muted animate-in slide-in-from-right-2"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <Image
                            src={
                              item.product.image ||
                              "/placeholder.svg?height=40&width=40&query=product"
                            }
                            alt={item.product.describtion}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded transition-transform duration-200 hover:scale-110"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {item.product.describtion}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              ${item.unitPrice.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-transparent transition-all duration-200 hover:scale-110"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-transparent transition-all duration-200 hover:scale-110"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-medium text-sm min-w-[60px] text-right">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <Button
                        className="w-full transition-all duration-200 hover:scale-105"
                        size="lg"
                        onClick={() => processTransaction("card")}
                        disabled={isProcessing}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          "Pay with Card"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent transition-all duration-200 hover:scale-105"
                        size="lg"
                        onClick={() => processTransaction("cash")}
                        disabled={isProcessing}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay with Cash
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent transition-all duration-200 hover:scale-105"
                        size="lg"
                        onClick={() => processTransaction("digital")}
                        disabled={isProcessing}
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Digital Payment
                      </Button>

                      {cart.length > 0 && (
                        <Button
                          variant="ghost"
                          className="w-full transition-all duration-200 hover:scale-105"
                          size="sm"
                          onClick={clearCart}
                          disabled={isProcessing}
                        >
                          Clear Cart
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <TransactionConfirmation
            transaction={completedTransaction}
            isOpen={!!completedTransaction}
            onClose={() => setCompletedTransaction(null)}
            onPrintReceipt={handlePrintReceipt}
          />

          <ReceiptGenerator
            transaction={completedTransaction}
            isOpen={showReceiptGenerator}
            onClose={() => setShowReceiptGenerator(false)}
          />
        </div>
      </div>
    </div>
  );
}
