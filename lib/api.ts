import {
  mockProducts,
  mockCustomers,
  mockDeliveryLocations,
} from "./mock-data";
import type {
  Product,
  Customer,
  DeliveryLocation,
  SalesOrder,
} from "@/types/pos";

const API_BASE_URL = "http://127.0.0.1:7626";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isFromMock?: boolean; // Ajout d'un flag pour indiquer si les données viennent du mock
}

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000), // Timeout de 3 secondes
    });
    return response.ok;
  } catch {
    return false;
  }
}

// : Promise<ApiResponse<Product[]>>
// API pour les produits
export async function fetchProducts(site_code: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/articles/?site_id=${site_code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Fetch products response:", response);

    if (!response.ok) throw new Error("Failed to fetch products");
    const data = await response.json();
    console.log("Fetch products data:", data);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    console.warn("[v0] API not available, using mock data for products");
    return {
      success: true,
      data: mockProducts,
      isFromMock: true,
      error: "API not available - using local data",
    };
  }
}

export async function fetchAdresseVente() {
  try {
    const response = await fetch(`${API_BASE_URL}/adresse/vente`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch delivery addresses");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    console.warn(
      "[v0] API not available, using mock data for delivery addresses"
    );
  }
}

export async function fetchClients() {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch delivery addresses");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    console.warn(
      "[v0] API not available, using mock data for delivery addresses"
    );
  }
}

export async function fetchTiers(customer_code: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/clients/tiers/?customer_code=${customer_code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch delivery addresses");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    console.warn(
      "[v0] API not available, using mock data for delivery addresses"
    );
  }
}

export async function fetchAdresseLivraison(customer_code: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/adresse/livraison?code_client=${customer_code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch delivery addresses");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    console.warn(
      "[v0] API not available, using mock data for delivery addresses"
    );
  }
}

export async function fetchCommandType() {
  try {
    const response = await fetch(`${API_BASE_URL}/command/type`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch delivery addresses");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function searchProducts(
  query: string
): Promise<ApiResponse<Product[]>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
      {
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!response.ok) throw new Error("Failed to search products");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, searching in mock data");
    const filteredProducts = mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.barcode?.includes(query)
    );
    return {
      success: true,
      data: filteredProducts,
      isFromMock: true,
      error: "API not available - searching local data",
    };
  }
}

// API pour les clients
export async function fetchCustomers(): Promise<ApiResponse<Customer[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Failed to fetch customers");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, using mock data for customers");
    return {
      success: true,
      data: mockCustomers,
      isFromMock: true,
      error: "API not available - using local data",
    };
  }
}

// API pour les sites de livraison
export async function fetchDeliveryLocations(): Promise<
  ApiResponse<DeliveryLocation[]>
> {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-locations`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Failed to fetch delivery locations");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn(
      "[v0] API not available, using mock data for delivery locations"
    );
    return {
      success: true,
      data: mockDeliveryLocations,
      isFromMock: true,
      error: "API not available - using local data",
    };
  }
}

function generateMockOrderId(): string {
  return `SOH${Date.now().toString().slice(-6)}`;
}

// API pour les commandes
export async function createSalesOrder(
  orderData: Omit<SalesOrder, "id" | "orderNumber" | "createdAt" | "updatedAt">
): Promise<ApiResponse<SalesOrder>> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Failed to create order");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, creating mock order");
    const mockOrder: SalesOrder = {
      ...orderData,
      id: generateMockOrderId(),
      orderNumber: generateMockOrderId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return {
      success: true,
      data: mockOrder,
      isFromMock: true,
      error: "API not available - order created locally",
    };
  }
}

export async function updateSalesOrder(
  orderId: string,
  updates: Partial<SalesOrder>
): Promise<ApiResponse<SalesOrder>> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Failed to update order");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("[v0] Error updating order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchSalesOrders(): Promise<ApiResponse<SalesOrder[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Failed to fetch orders");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("[v0] Error fetching orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// API pour les paiements
export async function processPayment(paymentData: {
  orderId: string;
  amount: number;
  method: "cash" | "card" | "digital";
  cardNumber?: string;
  amountTendered?: number;
}): Promise<
  ApiResponse<{
    transactionId: string;
    change?: number;
    status: "success" | "failed";
  }>
> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Payment processing failed");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, simulating payment");
    const mockPayment = {
      transactionId: `TXN${Date.now()}`,
      status: "success" as const,
      ...(paymentData.method === "cash" && paymentData.amountTendered
        ? { change: paymentData.amountTendered - paymentData.amount }
        : {}),
    };
    return {
      success: true,
      data: mockPayment,
      isFromMock: true,
      error: "API not available - payment simulated locally",
    };
  }
}

// API pour finaliser une commande
export async function finalizeOrder(
  orderId: string
): Promise<ApiResponse<SalesOrder>> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/finalize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Failed to finalize order");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, finalizing order locally");
    const mockFinalizedOrder: SalesOrder = {
      id: orderId,
      orderNumber: orderId,
      customerId: "mock-customer",
      deliveryLocationId: "mock-location",
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: "confirmed",
      priority: "normal",
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {
        id: "mock-customer",
        name: "Mock Customer",
        email: "mock@customer.com",
        phone: "0000000000",
        address: "Mock Address",
        customerCode: "",
        creditLimit: 0,
        paymentTerms: "",
        isActive: false,
        totalPurchases: 0,
      },
      deliveryLocation: {
        id: "mock-location",
        name: "Mock Location",
        address: "Mock Address",
        isActive: false,
        code: "",
        isDefault: false,
      },
      discount: 0,
      createdBy: "",
      modifications: [],
    };
    return {
      success: true,
      data: mockFinalizedOrder,
      isFromMock: true,
      error: "API not available - order finalized locally",
    };
  }
}
