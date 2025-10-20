"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction } from "@/types/pos";
import { Printer, Download, Mail, MessageSquare } from "lucide-react";
import { useRef } from "react";

interface ReceiptGeneratorProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptGenerator({
  transaction,
  isOpen,
  onClose,
}: ReceiptGeneratorProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  console.log(
    "[v0] ReceiptGenerator - isOpen:",
    isOpen,
    "transaction:",
    transaction
  );

  if (!transaction) {
    console.log(
      "[v0] ReceiptGenerator - No transaction provided, returning null"
    );
    return null;
  }

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 20px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .receipt { 
              max-width: 300px; 
              margin: 0 auto; 
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .separator { 
              border-top: 1px dashed #000; 
              margin: 10px 0; 
            }
            .flex { 
              display: flex; 
              justify-content: space-between; 
            }
            .item-line {
              margin: 2px 0;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = () => {
    // Simple implementation - in a real app, you'd use a PDF library like jsPDF
    handlePrint();
  };

  const handleEmailReceipt = () => {
    const subject = `Receipt - Transaction ${transaction.id.slice(-6)}`;
    const body = `Thank you for your purchase!\n\nTransaction ID: ${
      transaction.id
    }\nTotal: $${transaction.total.toFixed(
      2
    )}\nDate: ${transaction.timestamp.toLocaleString()}`;
    const mailtoLink = `mailto:${
      transaction.customer?.email || ""
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const handleSMSReceipt = () => {
    const message = `Receipt: Transaction ${transaction.id.slice(
      -6
    )} - Total: $${transaction.total.toFixed(
      2
    )} - Thank you for your purchase!`;
    const smsLink = `sms:${
      transaction.customer?.phone || ""
    }?body=${encodeURIComponent(message)}`;
    window.open(smsLink);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Receipt Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt Preview */}
          <div
            ref={receiptRef}
            className="receipt bg-white text-black p-4 border rounded-lg font-mono text-sm"
            style={{ fontFamily: "Courier New, monospace" }}
          >
            <div className="center bold text-lg mb-2">ACME RETAIL STORE</div>
            <div className="center text-xs mb-4">
              123 Main Street
              <br />
              City, State 12345
              <br />
              Tel: (555) 123-4567
            </div>

            <div className="separator"></div>

            <div className="flex bold mb-2">
              <span>RECEIPT</span>
              <span>#{transaction.id.slice(-6)}</span>
            </div>

            <div className="text-xs mb-4">
              Date: {transaction.timestamp.toLocaleDateString()}
              <br />
              Time: {transaction.timestamp.toLocaleTimeString()}
              <br />
              {transaction.customer && `Customer: ${transaction.customer.name}`}
            </div>

            <div className="separator"></div>

            {transaction.items.map((item, index) => (
              <div key={index} className="item-line">
                <div className="bold">{item.product.name}</div>
                <div className="flex">
                  <span>
                    {item.quantity} x ${item.unitpriceHT.toFixed(2)}
                  </span>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}

            <div className="separator"></div>

            <div className="flex">
              <span>Subtotal:</span>
              <span>${transaction.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex">
              <span>Tax:</span>
              <span>${transaction.tax.toFixed(2)}</span>
            </div>
            <div className="flex bold text-lg">
              <span>TOTAL:</span>
              <span>${transaction.total.toFixed(2)}</span>
            </div>

            <div className="separator"></div>

            <div className="flex">
              <span>Payment:</span>
              <span className="uppercase">{transaction.paymentMethod}</span>
            </div>

            <div className="separator"></div>

            <div className="center text-xs mt-4">
              Thank you for your business!
              <br />
              Please keep this receipt
              <br />
              for your records
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            {transaction.customer?.email && (
              <Button
                onClick={handleEmailReceipt}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            )}
            {transaction.customer?.phone && (
              <Button
                onClick={handleSMSReceipt}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <MessageSquare className="h-4 w-4" />
                SMS
              </Button>
            )}
          </div>

          <Button onClick={onClose} variant="ghost" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
