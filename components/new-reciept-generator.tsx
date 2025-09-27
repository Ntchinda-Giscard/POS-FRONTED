// Add these imports at the top of your page.tsx
import { PrinterIcon, Receipt } from "lucide-react";

// Enhanced processTransaction function - replace your existing one
const processTransaction = async (
  paymentMethod: "cash" | "card" | "digital"
) => {
  if (cart.length === 0) return;

  setIsProcessing(true);

  try {
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      items: cart.map((item) => ({
        ...item,
        // Ensure all pricing data is properly included
        unitpriceHT: item.unitpriceHT || item.product.base_price,
        totalpriceHT: item.totalpriceHT || item.unitpriceHT * item.quantity,
        totalPrice: item.totalPrice || item.unitpriceHT * item.quantity * 1.08, // Assuming 8% tax
      })),
      subtotal: subtotalTTC,
      subtotalHT: subtotalHT,
      tax: subtotalTTC - subtotalHT,
      total: subtotalTTC,
      paymentMethod,
      timestamp: new Date(),
      status: "completed" as const,
      customerCode: selectedClientCode,
      // Add receipt-specific data
      receiptData: {
        storeName: "Your Store Name",
        storeAddress: "Store Address Line 1\nStore Address Line 2",
        storePhone: "Phone: +237 XXX XXX XXX",
        cashierName: "Cashier Name",
        terminalId: "TERM-001",
        receiptNumber: `RCP-${Date.now()}`,
        currency: getCurrencyByCode(selectedCurrencyCode)?.symbol || "$",
        valoTotalHT,
        valoTotalTTC: valoTotalTTc,
      },
    };

    // Add to transaction history
    setTransactionHistory((prev) => [transaction, ...prev]);

    // Clear cart and close cart dialog
    clearCart();
    setIsCartOpen(false);

    // Show transaction confirmation with receipt options
    setCompletedTransaction(transaction);

    setIsProcessing(false);
  } catch (error) {
    console.error("Transaction failed:", error);
    setIsProcessing(false);
    // You might want to show an error toast here
  }
};

// Enhanced Receipt Generator Component
export const EnhancedReceiptGenerator = ({
  transaction,
  isOpen,
  onClose,
}: {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const printReceipt = () => {
    if (!transaction) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${transaction.receiptData?.receiptNumber}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
            line-height: 1.2;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .store-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .receipt-info {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .items {
            margin-bottom: 10px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .item-name {
            flex: 1;
            padding-right: 10px;
          }
          .item-details {
            font-size: 10px;
            color: #666;
            margin-left: 10px;
          }
          .totals {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .grand-total {
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 1px dashed #000;
            padding-top: 10px;
            font-size: 10px;
          }
          .print-controls {
            text-align: center;
            margin: 20px 0;
          }
          .print-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 0 5px;
          }
          .print-btn:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="store-name">${
              transaction.receiptData?.storeName || "STORE NAME"
            }</div>
            <div>${
              transaction.receiptData?.storeAddress || "Store Address"
            }</div>
            <div>${transaction.receiptData?.storePhone || "Phone Number"}</div>
          </div>
          
          <div class="receipt-info">
            <div>Receipt #: ${
              transaction.receiptData?.receiptNumber || transaction.id
            }</div>
            <div>Date: ${transaction.timestamp.toLocaleDateString()}</div>
            <div>Time: ${transaction.timestamp.toLocaleTimeString()}</div>
            <div>Cashier: ${
              transaction.receiptData?.cashierName || "Cashier"
            }</div>
            <div>Terminal: ${
              transaction.receiptData?.terminalId || "POS-001"
            }</div>
          </div>

          <div class="items">
            ${transaction.items
              .map(
                (item) => `
              <div class="item">
                <div class="item-name">${item.product.describtion}</div>
                <div>${transaction.receiptData?.currency}${(
                  item.totalPrice || 0
                ).toFixed(2)}</div>
              </div>
              <div class="item-details">
                ${item.quantity} x ${transaction.receiptData?.currency}${(
                  item.unitpriceHT || 0
                ).toFixed(2)} 
                (Code: ${item.item_code})
              </div>
            `
              )
              .join("")}
          </div>

          <div class="totals">
            <div class="total-line">
              <span>Subtotal (HT):</span>
              <span>${transaction.receiptData?.currency}${(
      transaction.subtotalHT || 0
    ).toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>Tax:</span>
              <span>${transaction.receiptData?.currency}${(
      transaction.tax || 0
    ).toFixed(2)}</span>
            </div>
            <div class="total-line grand-total">
              <span>TOTAL:</span>
              <span>${transaction.receiptData?.currency}${(
      transaction.total || 0
    ).toFixed(2)}</span>
            </div>
            ${
              transaction.receiptData?.valoTotalTTC &&
              transaction.receiptData.valoTotalTTC > transaction.total
                ? `
              <div style="margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px;">
                <div class="total-line">
                  <span>Valuation:</span>
                  <span>${
                    transaction.receiptData?.currency
                  }${transaction.receiptData.valoTotalTTC.toFixed(2)}</span>
                </div>
                <div class="total-line" style="color: green;">
                  <span>You Saved:</span>
                  <span>${transaction.receiptData?.currency}${(
                    transaction.receiptData.valoTotalTTC - transaction.total
                  ).toFixed(2)}</span>
                </div>
              </div>
            `
                : ""
            }
          </div>

          <div class="footer">
            <div>Payment Method: ${transaction.paymentMethod.toUpperCase()}</div>
            <div style="margin-top: 10px;">Thank you for your business!</div>
            <div>Please keep this receipt for your records</div>
          </div>
        </div>

        <div class="print-controls no-print">
          <button class="print-btn" onclick="window.print()">Print Receipt</button>
          <button class="print-btn" onclick="window.close()" style="background: #6c757d;">Close</button>
        </div>

        <script>
          // Auto-print option (uncomment if desired)
          // window.onload = function() { 
          //   setTimeout(() => window.print(), 500); 
          // }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  const emailReceipt = () => {
    if (!transaction) return;

    const subject = `Receipt ${
      transaction.receiptData?.receiptNumber || transaction.id
    }`;
    const body = `Dear Customer,\n\nThank you for your purchase!\n\nReceipt #: ${
      transaction.receiptData?.receiptNumber || transaction.id
    }\nDate: ${transaction.timestamp.toLocaleDateString()}\nTotal: ${
      transaction.receiptData?.currency
    }${transaction.total.toFixed(2)}\n\nBest regards,\n${
      transaction.receiptData?.storeName || "Your Store"
    }`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt Options
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-4 bg-green-50 rounded-lg dark:bg-green-950">
            <div className="text-green-600 font-medium">
              Transaction Completed Successfully!
            </div>
            <div className="text-sm text-green-600 mt-1">
              Receipt #:{" "}
              {transaction.receiptData?.receiptNumber || transaction.id}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={printReceipt}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <PrinterIcon className="h-4 w-4" />
              Print Receipt
            </Button>

            <Button
              onClick={emailReceipt}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <Receipt className="h-4 w-4" />
              Email Receipt
            </Button>

            <Button onClick={onClose} variant="ghost" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Transaction Confirmation Component
export const EnhancedTransactionConfirmation = ({
  transaction,
  isOpen,
  onClose,
  onPrintReceipt,
}: {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintReceipt: () => void;
}) => {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-green-600">
            Payment Successful!
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <div className="text-2xl font-bold">
            {transaction.receiptData?.currency}
            {transaction.total.toFixed(2)}
          </div>

          <div className="text-sm text-muted-foreground">
            <div>Transaction ID: {transaction.id}</div>
            <div>Payment Method: {transaction.paymentMethod.toUpperCase()}</div>
            <div>Date: {transaction.timestamp.toLocaleString()}</div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onPrintReceipt}
              className="flex-1 flex items-center gap-2"
            >
              <PrinterIcon className="h-4 w-4" />
              Print Receipt
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Update your existing component calls in the JSX to use these enhanced versions:
// Replace <TransactionConfirmation> with:

// Replace <ReceiptGenerator> with:

// Update your Transaction interface to include receiptData:
interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  subtotalHT: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card" | "digital";
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  customerCode?: string;
  receiptData?: {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    cashierName: string;
    terminalId: string;
    receiptNumber: string;
    currency: string;
    valoTotalHT?: number;
    valoTotalTTC?: number;
  };
}
