import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart,
  Plus,
  Minus,
  Package,
  Star
} from "lucide-react";
import { Product, CartItem } from './CkPaymentEcommerceDemo';
import { formatCkBTC } from '@/hooks/useCart';
import { useToast } from "@/hooks/use-toast";

// Component Props Interface
export interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  cartItems: CartItem[];
  getItemQuantity: (productId: string) => number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

// Individual Product Card Component
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  quantity: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  quantity,
  onUpdateQuantity
}) => {
  const { toast } = useToast();

  const handleAddToCart = () => {
    onAddToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleIncreaseQuantity = () => {
    onUpdateQuantity(product.id, quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    } else {
      onUpdateQuantity(product.id, 0); // This will remove the item
    }
  };

  return (
    <Card className="group h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:border-blue-500/30 overflow-hidden w-full">
      <div className="p-4 sm:p-5 flex-grow flex flex-col h-full">
        {/* Product Image */}
        <div className="aspect-square bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg mb-3 sm:mb-4 flex items-center justify-center group-hover:from-blue-100 group-hover:to-cyan-100 transition-colors">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
              width="300"
              height="300"
            />
          ) : (
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400 group-hover:text-blue-500 transition-colors" />
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2 sm:space-y-3 flex-grow flex flex-col">
          <div className="flex-grow">
            <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Category Badge */}
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          )}

          {/* Price and Stock */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {formatCkBTC(product.price)} <span className="text-sm sm:text-base font-medium">ckBTC</span>
              </div>
              
              {/* Stock Status */}
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>In Stock</span>
              </div>
            </div>
          </div>

          {/* Add to Cart / Quantity Controls */}
          <div className="pt-3 mt-auto">
            {quantity === 0 ? (
              <Button 
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 group-hover:shadow-md transition-all h-10 sm:h-11 text-sm sm:text-base"
                disabled={!product.inStock}
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add to Cart</span>
              </Button>
            ) : (
              <div className="space-y-2">
                {/* Quantity in Cart Indicator */}
                <div className="text-center text-xs sm:text-sm text-muted-foreground">
                  {quantity} in cart
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center justify-between gap-2 bg-gray-50 p-1.5 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecreaseQuantity}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-red-50 hover:border-red-200 flex-shrink-0"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                  
                  <span className="font-semibold text-base sm:text-lg min-w-[1.5rem] text-center">
                    {quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleIncreaseQuantity}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-green-50 hover:border-green-200 flex-shrink-0"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddToCart}
                    className="h-8 sm:h-9 px-2 sm:px-3 ml-auto bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm"
                    aria-label="Add another"
                  >
                    <Plus className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main ProductList Component
const ProductList: React.FC<ProductListProps> = ({
  products,
  onAddToCart,
  cartItems,
  getItemQuantity,
  onUpdateQuantity
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No Products Available
        </h3>
        <p className="text-sm text-muted-foreground">
          Check back later for new products.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground">
            Choose from our selection of premium items
          </p>
        </div>
        
        {/* Products Count */}
        <Badge variant="outline" className="text-sm">
          {products.length} {products.length === 1 ? 'Product' : 'Products'}
        </Badge>
      </div>

      {/* Products Grid - Responsive with better mobile layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              quantity={getItemQuantity(product.id)}
              onUpdateQuantity={onUpdateQuantity}
            />
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Star className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Premium Quality Guaranteed
            </h4>
            <p className="text-sm text-blue-700">
              All products are carefully selected and backed by our quality guarantee. 
              Pay securely with ckBTC on the Internet Computer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;