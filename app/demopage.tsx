export default function demopage() {
  return (
    <div>
      <Dialog open={isCartOpen} onOpenChange={() => {}}>
        <DialogContent
          className="min-w-xl max-h-[90vh] overflow-scroll"
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
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div
                      key={item.item_code}
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
                          {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                          {item.unitpriceHT?.toFixed(2)} chacun
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 bg-transparent transition-all duration-200 hover:scale-110"
                          onClick={() =>
                            updateQuantity(item.item_code, item.quantity - 1)
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
                            updateQuantity(item.item_code, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                      <span className="font-medium   text-sm min-w-[60px] text-right rounded-sm px-2 py-1">
                        HT:{"  "}
                        {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                        {item.totalpriceHT?.toFixed(2)}
                      </span>

                      <span className="font-medium text-sm min-w-[60px] text-right">
                        TTC:{"  "}
                        {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                        {item.totalPrice?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <h2>Montant</h2>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total HT:</span>
                    <span>
                      {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                      {subtotalHT?.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total TTC:</span>
                    <span>
                      {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                      {subtotalTTC?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <h2>Valorisation</h2>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Valorisation HT:</span>
                    <span className="text-gray-500">
                      {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                      {valoTotalHT?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-2xl">
                  <span>Valorisation TTC:</span>
                  <span className="text-green-600">
                    {getCurrencyByCode(selectedCurrencyCode)?.symbol}
                    {valoTotalTTc?.toFixed(2)}
                  </span>
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
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
    </div>
  );
}
