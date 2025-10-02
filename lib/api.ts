import { Tabs } from "@/components/ui/tabs";
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
import { toast } from "sonner";

const API_BASE_URL = "http://127.0.0.1:7626";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isFromMock?: boolean; // Ajout d'un flag pour indiquer si les données viennent du mock
}

type TaxRegime = {
  code: string;
};

type CurrencyType = {
  code: string;
  symbol?: string;
  name?: string;
};

type PaymentConditionType = {
  code: string;
};

type Escompte = {
  code: string;
};

type CondFactType = {
  code: string;
};

export type Pricing = {
  gratuit: Record<string, any>[] | null;
  items_code: string;
  subtotal: number;
  prix_brut: number;
  prix_net: number;
  total_HT: number;
};

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
export async function fetchProducts(
  site_code: string
): Promise<ApiResponse<Product[]>> {
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
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("New message received", {
      description: "From John Doe - 2 minutes ago",
      icon: "",
      classNames: {
        description: "text-foreground/80",
      },
    });
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
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
    console.error(error);
    console.warn(
      "[v0] API not available, using mock data for delivery addresses"
    );
    return { success: false, data: [] };
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
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
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
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
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
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
    console.error(error);
    console.warn(
      "[v0] API not available, using mock data for delivery addresses"
    );
  }
}

// API pour get les Adresse de livraison
export async function fetchAdresseExpedition(legacy_comp: string | undefined) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/adresse/expedition?legacy_comp=${legacy_comp}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch delivery addresses");
    const data = await response.json();
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
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
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
    console.error(error);
    throw error;
  }
}

export async function searchProducts(
  site_id: string,
  query: string
): Promise<ApiResponse<Product[]>> {
  try {
    console.log("Query", encodeURIComponent(query));
    const response = await fetch(
      `${API_BASE_URL}/articles/search?sitde_id=${site_id}&q=${encodeURIComponent(
        query
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to search products");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, searching in mock data");
  }
}

// API pour les regime de taxe
export async function fetchTaxRegimes(
  customer_code: string
): Promise<ApiResponse<TaxRegime>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/taxe/regime?customer_code=${customer_code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch tax regimes");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, using mock data for tax regimes");
    return { success: false, data: { code: "" } };
    throw error;
  }
}

//API pour les mode de livraison
export async function fetchModeLivraison() {
  try {
    const response = await fetch(`${API_BASE_URL}/livraison/modelivraison`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch delivery addresses");
    console.log("Fetch mode livraison response:", response);
    const data = await response.json();
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
    console.error(error);
    console.warn(
      "[v0] API not available, using mock data for delivery addresses"
    );
  }
}

//API pour les tranzporteur
export async function fetchTransporteur() {
  try {
    const response = await fetch(`${API_BASE_URL}/livraison/transporteur`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch delivery addresses");
    console.log("Fetch mode livraison response:", response);
    const data = await response.json();
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
    console.error(error);
    console.warn(
      "[v0] API not available, using mock data for delivery addresses"
    );
  }
}

// API pour les devise
export async function fetchCommandCurrency(
  customer_code: string
): Promise<ApiResponse<CurrencyType>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/currency/code?customer_code=${customer_code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch tax regimes");
    console.log("transporteur", response);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, using mock data for tax regimes");
    return { success: false, data: { code: "" } };
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

// API pour les condition de payement
export async function fetchPaymentCondition(
  customer_code: string
): Promise<ApiResponse<PaymentConditionType>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/facture/payment-condition?customer_code=${customer_code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch tax regimes");
    console.log("transporteur", response);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, using mock data for tax regimes");
    throw error;
  }
}

// API pour les escompte
export async function fetchEscomtpe(
  customer_code: string
): Promise<ApiResponse<Escompte>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/facture/escomte?customer_code=${customer_code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch tax regimes");
    console.log("transporteur", response);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, using mock data for tax regimes");
    throw error;
  }
}

// API pour les condition de facturation
export async function fetchCondFact(
  customer_code: string
): Promise<ApiResponse<CondFactType>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/facture/condfac?customer_code=${customer_code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch tax regimes");
    console.log("transporteur", response);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, using mock data for tax regimes");
    throw error;
  }
}

function generateMockOrderId(): string {
  return `SOH${Date.now().toString().slice(-6)}`;
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
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
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
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
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

export type PricingRequest = {
  item_code: string;
  quantity: string;
  customer_code: string;
  currency: string;
  unit_of_measure: string;
};
// API pour calculer le prix de l'article avec les remises et taxes
export async function fetchPricing(
  requests: PricingRequest[]
): Promise<ApiResponse<Pricing[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requests),
    });
    if (!response.ok) throw new Error("Failed to fetch pricing");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, finalizing order locally");
    return {
      success: false,
      error: "API not available - pricing could not be fetched",
      data: [],
      isFromMock: true,
    };
  }
}

export interface Tax {
  code: string;
  item_code: string;
  taux: number;
  exonerer?: string;
  compte_comptable?: string;
}

type TaxRequest = {
  item_code: string;
  regime_taxe_tiers: string;
  groupe_societe?: string;
  type_taxe?: string;
};

export async function fetchAppliedTaxes(
  requests: TaxRequest[]
): Promise<ApiResponse<Tax[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/taxe/applied/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requests),
    });
    if (!response.ok) throw new Error("Failed to fetch applied taxes");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn("[v0] API not available, fetching applied taxes locally");
    return {
      success: false,
      error: "API not available - applied taxes could not be fetched",
      data: [],
      isFromMock: true,
    };
  }
}

// API pour recuperer les element de facturation
export type ElementFacturation = {
  code_customer: string;
};

interface ElementFacturationResponse {
  code: string;
  amount: number;
  type: number;
  majmin: number;
  description: string;
}

export async function fetchElementFacturation(
  client_code: string
): Promise<ApiResponse<ElementFacturationResponse[]>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/facture/element?customer_code=${client_code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch element facturation");
    const data = await response.json();
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has not been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
    console.error("Error fetching element facturation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createSalseOrder(request: SalesOrder) {
  try {
    const response = await fetch(`${API_BASE_URL}/command/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Failed to create sales order");
    const data = await response.json();
    toast.success("Event has been created");
    return { success: true, data };
  } catch (error) {
    toast.error("Event has not been created", {
      description: "Monday, January 3rd at 6:00pm",
    });
    console.error("[v0] Error creating sales order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function synchronizeData() {
  try {
    const response = await fetch(`${API_BASE_URL}/synchronize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("Failed to synchronize data");
    const data = await response.json();
    toast.loading("Synchronizing data...");
    if (data.success) {
      toast.success("Data synchronized successfully");
    }
    return { success: true, data };
  } catch (error) {
    toast.error("Data synchronization failed", {
      description: "Please try again later.",
    });
    console.error("[v0] Error synchronizing data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}
