import { Check, X, TrendingUp, DollarSign, Star, Zap, ShoppingCart } from 'lucide-react';

interface Product {
  name: string;
  price: number;
  image: string;
  specs: {
    [key: string]: string | number | boolean;
  };
  pros: string[];
  cons: string[];
  rating?: number;
  badge?: string;
}

interface ProductComparisonProps {
  product1: Product;
  product2: Product;
  winner?: 'product1' | 'product2' | 'tie';
}

export function ProductComparison({ product1, product2, winner }: ProductComparisonProps) {
  const commonSpecs = Object.keys(product1.specs).filter(key => key in product2.specs);
  
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-purple-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <h3 className="text-white font-bold text-lg text-center flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-yellow-300" />
          Side-by-Side Comparison
          <Zap className="w-5 h-5 text-yellow-300" />
        </h3>
      </div>
      
      <div className="grid grid-cols-2 divide-x-2 divide-gray-100">
        {/* Product 1 */}
        <div className={`${winner === 'product1' ? 'bg-green-50' : 'bg-white'} relative`}>
          {winner === 'product1' && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              BEST CHOICE
            </div>
          )}
          {product1.badge && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse z-10">
              {product1.badge}
            </div>
          )}
          
          <div className="p-6">
            {/* Product Image & Name */}
            <div className="text-center mb-4">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <span className="text-5xl">{product1.image}</span>
              </div>
              <h4 className="font-bold text-lg text-gray-800">{product1.name}</h4>
              <div className="text-2xl font-bold text-green-600 mt-2">
                ${product1.price}
              </div>
              {product1.rating && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">{product1.rating}/5</span>
                </div>
              )}
            </div>
            
            {/* Key Specs */}
            <div className="space-y-2 mb-4">
              <h5 className="font-semibold text-sm text-gray-700 mb-2">Key Features:</h5>
              {commonSpecs.slice(0, 4).map(spec => (
                <div key={spec} className="flex justify-between text-sm">
                  <span className="text-gray-600">{spec}:</span>
                  <span className="font-medium text-gray-800">{String(product1.specs[spec])}</span>
                </div>
              ))}
            </div>
            
            {/* Pros */}
            <div className="mb-4">
              <h5 className="font-semibold text-sm text-green-700 mb-2">Pros:</h5>
              <ul className="space-y-1">
                {product1.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Cons */}
            <div className="mb-4">
              <h5 className="font-semibold text-sm text-red-700 mb-2">Cons:</h5>
              <ul className="space-y-1">
                {product1.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-sm">
                    <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Action Button */}
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg">
              <ShoppingCart className="w-5 h-5" />
              View Best Price
            </button>
          </div>
        </div>
        
        {/* Product 2 */}
        <div className={`${winner === 'product2' ? 'bg-green-50' : 'bg-white'} relative`}>
          {winner === 'product2' && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              BEST CHOICE
            </div>
          )}
          {product2.badge && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse z-10">
              {product2.badge}
            </div>
          )}
          
          <div className="p-6">
            {/* Product Image & Name */}
            <div className="text-center mb-4">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <span className="text-5xl">{product2.image}</span>
              </div>
              <h4 className="font-bold text-lg text-gray-800">{product2.name}</h4>
              <div className="text-2xl font-bold text-green-600 mt-2">
                ${product2.price}
              </div>
              {product2.rating && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">{product2.rating}/5</span>
                </div>
              )}
            </div>
            
            {/* Key Specs */}
            <div className="space-y-2 mb-4">
              <h5 className="font-semibold text-sm text-gray-700 mb-2">Key Features:</h5>
              {commonSpecs.slice(0, 4).map(spec => (
                <div key={spec} className="flex justify-between text-sm">
                  <span className="text-gray-600">{spec}:</span>
                  <span className="font-medium text-gray-800">{String(product2.specs[spec])}</span>
                </div>
              ))}
            </div>
            
            {/* Pros */}
            <div className="mb-4">
              <h5 className="font-semibold text-sm text-green-700 mb-2">Pros:</h5>
              <ul className="space-y-1">
                {product2.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Cons */}
            <div className="mb-4">
              <h5 className="font-semibold text-sm text-red-700 mb-2">Cons:</h5>
              <ul className="space-y-1">
                {product2.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-sm">
                    <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Action Button */}
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg">
              <ShoppingCart className="w-5 h-5" />
              View Best Price
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Verdict Bar */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4">
        <div className="text-center">
          {winner === 'product1' && (
            <p className="font-bold text-purple-800">
              🏆 {product1.name} is the better choice for most people!
            </p>
          )}
          {winner === 'product2' && (
            <p className="font-bold text-purple-800">
              🏆 {product2.name} is the better choice for most people!
            </p>
          )}
          {winner === 'tie' && (
            <p className="font-bold text-purple-800">
              🤝 Both are excellent choices - depends on your specific needs!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}