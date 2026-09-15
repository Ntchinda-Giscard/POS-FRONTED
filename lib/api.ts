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
import { POPServer } from "@/stores/pop-server";

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

type SettingsInput = {
  popServer: string;
  username: string;
  port: number;
  password: string;
  addressVente?: string;
  siteLivraison?: string;
};

export type CommandeLivraison = {
  code: string;
  client_livre: string;
  client_comm: string;
};

export type CommandeQuantite = {
  code: string;
  description: string;
  quantite: number;
  quantite_total: number;
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
    toast.success("Articles récupérés avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("Impossible de récupérer les articles", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      icon: "",
      classNames: {
        description: "text-foreground/80",
      },
    });
    console.error(error);
    return {
      success: true,
      data: mockProducts,
      isFromMock: true,
      error: "API not available - using local data",
    };
  }
}

export async function fetchProductImage(item_code: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${item_code}/image`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch product image");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.warn(`[v0] Error fetching image for ${item_code}`, error);
    return { success: false, data: null };
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
    toast.success("Addresse de vente récupérée avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("Impossible de récupérer l'adresse de vente", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error(error);
    console.warn(
      "[v0] API not available, using mock data for delivery addresses"
    );
  }
}

export async function fetchCommandes(): Promise<ApiResponse<CommandeLivraison[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/livraison/commande`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch commandes");
      const data = await response.json();
      return { success: true, data };
  } catch (error) {
     console.error(error);
     return { success: false, data: [] };
  }
}

export async function fetchCommandeQuantite(commande_number: string): Promise<ApiResponse<CommandeQuantite[]>> {
  try {
     const response = await fetch(`${API_BASE_URL}/livraison/commande/quantite?commande_number=${commande_number}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch commande quantite");
      const data = await response.json();
      return { success: true, data };
  } catch (error) {
     console.error(error);
     return { success: false, data: [] };
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error(error);
    throw error;
  }
}

export async function searchProducts(
  site_id: string,
  query: string
  //@ts-ignore
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error updating order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error fetching orders:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    };
  }
}

// API pour les paiements
export type PaymentMethod = "cash" | "card" | "digital";

export type PaymentRequest = {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  amountTendered?: number; // cash
  reference?: string; // card approval ref / mobile money txn id
  provider?: "MOMO" | "OM"; // digital
  phone?: string; // digital
  currency?: string;
  customerCode?: string;
  userCode?: string;   // cashier (AUTILIS.USR_0)
  site?: string;       // the open cash session of this site is attached
};

export type PaymentRecord = {
  transactionId: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  amountTendered?: number | null;
  change?: number | null;
  reference?: string | null;
  provider?: string | null;
  phone?: string | null;
  currency?: string | null;
  customerCode?: string | null;
  status: "success" | "failed";
  createdAt: string;
};

async function readError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {}
  return fallback;
}

// Enregistre un paiement déjà encaissé. Pas de simulation en cas d'échec :
// un paiement non enregistré doit être visible par le caissier.
export async function processPayment(
  paymentData: PaymentRequest
): Promise<ApiResponse<PaymentRecord>> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      throw new Error(
        await readError(response, "Échec de l'enregistrement du paiement")
      );
    }
    const data = (await response.json()) as PaymentRecord;
    return { success: true, data };
  } catch (error) {
    console.error("[v0] Error processing payment:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Échec de l'enregistrement du paiement",
    };
  }
}

export async function fetchPayments(filters?: {
  day?: string; // YYYY-MM-DD
  orderId?: string;
  limit?: number;
}): Promise<ApiResponse<PaymentRecord[]>> {
  try {
    const params = new URLSearchParams();
    if (filters?.day) params.set("day", filters.day);
    if (filters?.orderId) params.set("order_id", filters.orderId);
    if (filters?.limit) params.set("limit", String(filters.limit));
    const query = params.toString();
    const response = await fetch(
      `${API_BASE_URL}/payments/${query ? `?${query}` : ""}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!response.ok) throw new Error("Failed to fetch payments");
    const data = (await response.json()) as PaymentRecord[];
    return { success: true, data };
  } catch (error) {
    console.error("[v0] Error fetching payments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
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
  code_taxe: string;
  item_code: string;
  taux: number;
  exonere?: boolean | null;
  compte_comptable?: string | null;
  regle?: string | null;
  legislation?: string | null;
  description?: string | null;
  warning?: string | null;
}

export type TaxRequest = {
  item_code: string;
  regime_taxe_tiers: string;
  site?: string;              // sales site → legislation and issuing state
  groupe_societe?: string;
  type_taxe?: string;
  date?: string;
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
    toast.success("Element de facturation trouver avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("Les éléments de facturation n’ont pas pu être trouvés.", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("Error fetching element facturation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
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
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error creating sales order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      data: null,
    };
  }
}

export interface LivraisonHeader {
  id: string;
  date_expedition: string;
  date_livraison: string;
  client_livre: string;
  commande_livre: string;
  site_vente: string;
  type: string;
  status?: string;
}

export interface AddLivraisonRequest {
  livraison: LivraisonHeader;
  livraison_quantite: CommandeQuantite[];
}

export async function createLivraison(request: AddLivraisonRequest): Promise<ApiResponse<AddLivraisonRequest>> {
  try {
    const response = await fetch(`${API_BASE_URL}/livraison/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Failed to create livraison");
    const data = await response.json();
    toast.success("Livraison créée avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("Échec de la création de la livraison", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error creating livraison:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      data: undefined,
    };
  }
}

export async function synchronizeData() {
  // Show the loading toast and store its ID
  const toastId = toast.loading("Synchronizing data...");

  try {
    const response = await fetch(`${API_BASE_URL}/synchronize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) throw new Error("Failed to synchronize data");

    const data = await response.json();

    // Update the toast once the request completes successfully
    toast.success("Data synchronized successfully", {
      id: toastId,
    });

    return { success: true, data };
  } catch (error) {
    // Update the same toast to show the error
    toast.error("Data synchronization failed", {
      id: toastId,
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });

    console.error("[v0] Error synchronizing data:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      data: null,
    };
  }
}

export async function saveSettingsPOP(request: POPServer) {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Sauvegarde des paramètres a échoué");
    const data = await response.json();
    toast.success("Paramètres sauvegardés avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("La sauvegarde des paramètres a échoué", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error creating sales order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      data: null,
    };
  }
}

export async function getSettingsPOP() {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Récupération des paramètres a échoué");
    const data = await response.json();
    toast.success("Paramètres récupérés avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("La récupération des paramètres a échoué", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error creating sales order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      data: null,
    };
  }
}

export async function saveFolderConfig(folderPath: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/add/folder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: folderPath }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Sauvegarde du dossier a échoué");
    const data = await response.json();
    toast.success("Dossier sauvegardé avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("La sauvegarde du dossier a échoué", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error saving folder configuration:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      data: null,
    };
  }
}

export async function getFolderConfig() {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/get/folder`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Récupération du dossier a échoué");
    const data = await response.json();
    toast.success("Dossier récupéré avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("La récupération du dossier a échoué", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error getting folder configuration:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      data: null,
    };
  }
}




export async function fetchLivraison(): Promise<ApiResponse<LivraisonHeader[]> | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/livraison/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Récupération de la livraison a échoué");
    const data = await response.json();
    toast.success("Livraison récupérée avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("La récupération de la livraison a échoué", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error fetching delivery:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      data: undefined,
    };
  }
}

export type LivraisonType = {
  code: string
  label?: string
}

export async function fetchLivraisonTypes(): Promise<ApiResponse<LivraisonType[]> | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/livraison/type`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Récupération des types de livraison a échoué");
    const data = await response.json();
    toast.success("Types de livraison récupérés avec succès");
    return { success: true, data };
  } catch (error) {
    toast.error("La récupération des types de livraison a échoué", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error fetching livraison types:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
      data: undefined,
    };
  }
}

export async function updateLivraisonStatus(id: string, status: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/livraison/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Mise à jour du statut a échoué");
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    toast.error("Échec de la mise à jour du statut", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    });
    console.error("[v0] Error updating livraison status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue",
    };
  }
}
// ---------------------------------------------------------------------------
// Users (Sage X3 AUTILIS) + local PIN
// ---------------------------------------------------------------------------
export type PosUser = {
  code: string;
  name: string;
  login?: string | null;
  email?: string | null;
  profile?: string | null;
  role: "admin" | "manager" | "cashier";
  has_pin: boolean;
  last_login_at?: string | null;
};

async function getJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(20000),
      ...init,
    });
    if (!response.ok) throw new Error(await readError(response, `Requête échouée (${response.status})`));
    if (response.status === 204) return { success: true };
    const text = await response.text();
    return { success: true, data: text ? (JSON.parse(text) as T) : (null as T) };
  } catch (error) {
    console.error("[api]", url, error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}

export const fetchUsers = () => getJson<PosUser[]>(`${API_BASE_URL}/users/`);

export const loginUser = (user_code: string, pin: string) =>
  getJson<PosUser>(`${API_BASE_URL}/users/login`, { method: "POST", body: JSON.stringify({ user_code, pin }) });

export const changeUserPin = (user_code: string, old_pin: string, new_pin: string) =>
  getJson<{ status: string }>(`${API_BASE_URL}/users/pin`, {
    method: "POST",
    body: JSON.stringify({ user_code, old_pin, new_pin }),
  });

// ---------------------------------------------------------------------------
// Cash sessions (ouverture / fermeture de caisse)
// ---------------------------------------------------------------------------
export type CashMovement = {
  id: number;
  type: "in" | "out";
  amount: number;
  reason?: string | null;
  user_code?: string | null;
  created_at: string;
};

export type CashSession = {
  id: number;
  site?: string | null;
  user_code?: string | null;
  closed_by?: string | null;
  opened_at: string;
  closed_at?: string | null;
  opening_amount: number;
  cash_sales: number;
  cash_in: number;
  cash_out: number;
  expected_amount: number;
  closing_amount?: number | null;
  difference?: number | null;
  currency?: string | null;
  status: "open" | "closed";
  notes?: string | null;
  payments_count: number;
  sales_by_method: Record<string, number>;
  movements: CashMovement[];
};

export const fetchCurrentCashSession = (site?: string) =>
  getJson<CashSession | null>(`${API_BASE_URL}/cash/current${site ? `?site=${encodeURIComponent(site)}` : ""}`);

export const openCashSession = (body: { site: string; user_code: string; opening_amount: number; currency?: string; notes?: string }) =>
  getJson<CashSession>(`${API_BASE_URL}/cash/open`, { method: "POST", body: JSON.stringify(body) });

export const addCashMovement = (sessionId: number, body: { type: "in" | "out"; amount: number; reason?: string; user_code?: string }) =>
  getJson<CashSession>(`${API_BASE_URL}/cash/${sessionId}/movement`, { method: "POST", body: JSON.stringify(body) });

export const closeCashSession = (sessionId: number, body: { closing_amount: number; user_code?: string; notes?: string }) =>
  getJson<CashSession>(`${API_BASE_URL}/cash/${sessionId}/close`, { method: "POST", body: JSON.stringify(body) });

export const fetchCashSessions = (site?: string, limit = 50) =>
  getJson<CashSession[]>(`${API_BASE_URL}/cash/sessions?limit=${limit}${site ? `&site=${encodeURIComponent(site)}` : ""}`);

// ---------------------------------------------------------------------------
// Site identity (FACILITY / BPADDRESS / COMPANY) for receipts
// ---------------------------------------------------------------------------
export type SiteInfo = {
  code: string;
  name: string;
  short_name?: string | null;
  company_code?: string | null;
  company_name?: string | null;
  legislation?: string | null;
  currency?: string | null;
  address_lines: string[];
  postal_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  country_name?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;
  vat_number?: string | null;
  company_registration?: string | null;
};

export const fetchSiteInfo = (site?: string) =>
  getJson<SiteInfo>(`${API_BASE_URL}/site/info${site ? `?site=${encodeURIComponent(site)}` : ""}`);

// ---------------------------------------------------------------------------
// Payment detail (receipt reprint)
// ---------------------------------------------------------------------------
export type PaymentLine = {
  line: number;
  item_code: string;
  description: string;
  quantity: number;
  unit?: string | null;
  gross_price: number;
  net_price_ht: number;
  net_price_ttc: number;
  tax_code?: string | null;
  free: boolean;
};

export type PaymentDetail = PaymentRecord & {
  customerName?: string | null;
  userCode?: string | null;
  cashSessionId?: number | null;
  site?: string | null;
  lines: PaymentLine[];
  total_ht?: number | null;
  total_ttc?: number | null;
  order_date?: string | null;
};

export const fetchPaymentDetail = (transactionId: string) =>
  getJson<PaymentDetail>(`${API_BASE_URL}/payments/${encodeURIComponent(transactionId)}`);

export type PaymentFilters = {
  day?: string;
  date_from?: string;
  date_to?: string;
  method?: string;
  user_code?: string;
  session_id?: number;
  search?: string;
  order_id?: string;
  limit?: number;
};

export const searchPayments = (filters: PaymentFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  return getJson<(PaymentRecord & { customerName?: string | null; userCode?: string | null; site?: string | null })[]>(
    `${API_BASE_URL}/payments/?${params.toString()}`
  );
};

// ---------------------------------------------------------------------------
// Articles: barcode + stock
// ---------------------------------------------------------------------------
export const fetchArticleByBarcode = (site_id: string, code: string) =>
  getJson<Product>(`${API_BASE_URL}/articles/barcode?site_id=${encodeURIComponent(site_id)}&code=${encodeURIComponent(code)}`);

export type StockLot = {
  lot?: string | null;
  location?: string | null;
  status?: string | null;
  quantity: number;
  allocated: number;
  received_at?: string | null;
};

export type StockItem = {
  item_code: string;
  description: string;
  category?: string | null;
  unit?: string | null;
  barcode?: string | null;
  quantity: number;
  allocated: number;
  available: number;
  safety_stock: number;
  max_stock: number;
  reorder_qty: number;
  status: "out" | "low" | "ok" | "over";
  lots: StockLot[];
};

export const fetchStock = (site_id: string, withLots = false) =>
  getJson<StockItem[]>(`${API_BASE_URL}/articles/stock?site_id=${encodeURIComponent(site_id)}&with_lots=${withLots}`);

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export type ClientDetail = {
  code: string;
  name: string;
  short_name?: string | null;
  category?: string | null;
  currency?: string | null;
  payment_term?: string | null;
  payment_term_label?: string | null;
  tax_rule?: string | null;
  price_type?: string | null;
  credit_limit: number;
  credit_control?: string | null;
  invoice_customer?: string | null;
  payer?: string | null;
  is_active: boolean;
  contact?: string | null;
  address_lines: string[];
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  orders_count: number;
  orders_total_ttc: number;
  last_order_date?: string | null;
  payments_count: number;
  payments_total: number;
  last_payment_at?: string | null;
};

export type ClientOrder = {
  order_id: string;
  order_type?: string | null;
  date?: string | null;
  site?: string | null;
  currency?: string | null;
  total_ht: number;
  total_ttc: number;
  status?: string | null;
  created_by?: string | null;
  lines: number;
  paid: number;
  payment_methods: string[];
  source: "x3" | "pos";
};

export const fetchClientDetail = (code: string) =>
  getJson<ClientDetail>(`${API_BASE_URL}/clients/${encodeURIComponent(code)}/detail`);

export const fetchClientOrders = (code: string, limit = 100) =>
  getJson<ClientOrder[]>(`${API_BASE_URL}/clients/${encodeURIComponent(code)}/orders?limit=${limit}`);

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
export type ReportPeriod = "today" | "yesterday" | "week" | "month" | "year" | "last7" | "last30";

export type ReportSummary = {
  date_from: string;
  date_to: string;
  site?: string | null;
  currency?: string | null;
  kpi: {
    revenue: number;
    transactions: number;
    average_basket: number;
    cash_total: number;
    card_total: number;
    digital_total: number;
    items_sold: number;
    orders_revenue_ht: number;
    tax_total: number;
    previous_revenue: number;
    previous_transactions: number;
    revenue_change_pct?: number | null;
  };
  by_day: { date: string; label: string; revenue: number; transactions: number }[];
  by_method: { method: string; label: string; total: number; count: number }[];
  by_user: { user_code: string; name?: string | null; transactions: number; revenue: number }[];
  by_hour: { hour: number; transactions: number; revenue: number }[];
  top_products: { item_code: string; description: string; quantity: number; revenue_ht: number; revenue_ttc: number }[];
  cash_sessions: number;
  cash_difference_total: number;
  x3: {
    orders: number;
    revenue_ttc: number;
    revenue_ht: number;
    first_date?: string | null;
    last_date?: string | null;
    by_month: { date: string; label: string; revenue: number; transactions: number }[];
    top_products: { item_code: string; description: string; quantity: number; revenue_ht: number; revenue_ttc: number }[];
    top_customers: { user_code: string; name?: string | null; transactions: number; revenue: number }[];
  };
};

const reportQuery = (opts: { period?: ReportPeriod; date_from?: string; date_to?: string; site?: string }) => {
  const params = new URLSearchParams();
  if (opts.date_from && opts.date_to) {
    params.set("date_from", opts.date_from);
    params.set("date_to", opts.date_to);
  } else if (opts.period) params.set("period", opts.period);
  if (opts.site) params.set("site", opts.site);
  return params.toString();
};

export const fetchReportSummary = (opts: { period?: ReportPeriod; date_from?: string; date_to?: string; site?: string }) =>
  getJson<ReportSummary>(`${API_BASE_URL}/reports/summary?${reportQuery(opts)}`);

export const reportExportUrl = (kind: "payments" | "sales-lines", opts: { period?: ReportPeriod; date_from?: string; date_to?: string; site?: string }) =>
  `${API_BASE_URL}/reports/export/${kind}.csv?${reportQuery(opts)}`;

// ---------------------------------------------------------------------------
// App settings + export to X3
// ---------------------------------------------------------------------------
export type AppSettings = Record<string, string>;

export const fetchAppSettings = () => getJson<AppSettings>(`${API_BASE_URL}/settings/app`);

export const saveAppSettings = (values: Partial<AppSettings>) =>
  getJson<AppSettings>(`${API_BASE_URL}/settings/app`, { method: "PUT", body: JSON.stringify(values) });

export type ExportPending = { site?: string | null; counts: Record<string, number>; total: number };
export type ExportResult = {
  batch: string;
  folder: string;
  files: { table: string; path: string; rows: number }[];
  total_rows: number;
  emailed: boolean;
  recipient?: string | null;
  email_error?: string | null;
};
export type ExportBatch = { batch: string; exported_at: string; tables: Record<string, number>; files: string[]; emailed: boolean };

export const fetchExportPending = (site?: string) =>
  getJson<ExportPending>(`${API_BASE_URL}/export/pending${site ? `?site=${encodeURIComponent(site)}` : ""}`);

export const runExportToX3 = (site?: string, sendEmail = true) =>
  getJson<ExportResult>(`${API_BASE_URL}/export/x3?send_email=${sendEmail}${site ? `&site=${encodeURIComponent(site)}` : ""}`, { method: "POST" });

export const fetchExportHistory = () => getJson<ExportBatch[]>(`${API_BASE_URL}/export/history`);
