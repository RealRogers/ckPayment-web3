import React from 'react';
import { CheckCircle, AlertCircle, X, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

export type PaymentStatusType = 'idle' | 'processing' | 'success' | 'error';

export interface PaymentStatusProps {
  status: PaymentStatusType;
  transactionId?: string;
  error?: string;
  amount?: number;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status = 'idle',
  transactionId,
  error,
  amount,
  onRetry,
  onClose,
  className,
}) => {
  // Don't render anything in idle state
  if (status === 'idle') {
    return null;
  }

  // Processing state
  if (status === 'processing') {
    return (
      <Alert className={cn('border-blue-500/20 bg-blue-50 dark:bg-blue-900/10', className)}>
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="mt-0.5 sm:mt-0">
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-500 flex-shrink-0" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-base sm:text-lg text-blue-800 dark:text-blue-200">
              Processing Payment
            </AlertTitle>
            <AlertDescription className="text-sm sm:text-base text-blue-700 dark:text-blue-300">
              Please wait while we process your payment...
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <Alert className={cn('border-green-500/20 bg-green-50 dark:bg-green-900/10', className)}>
        <div className="relative">
          <div className="flex items-start gap-3 sm:gap-4">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between items-start gap-2">
                <AlertTitle className="text-base sm:text-lg text-green-800 dark:text-green-200">
                  Payment Successful!
                </AlertTitle>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 -mt-1 -mr-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20"
                    onClick={onClose}
                    aria-label="Close success message"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <AlertDescription className="text-sm sm:text-base text-green-700 dark:text-green-300 space-y-3">
                <p>Your payment of <span className="font-medium">{amount?.toFixed(8)} ckBTC</span> has been processed successfully.</p>
                
                {transactionId && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                      Transaction Details
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                      <Badge 
                        variant="outline" 
                        className="font-mono bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 py-1 px-2 truncate"
                      >
                        {transactionId.substring(0, 8)}...{transactionId.substring(transactionId.length - 4)}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        onClick={() => {
                          // In a real app, this would link to a block explorer
                          console.log('View transaction:', transactionId);
                        }}
                      >
                        View on Explorer <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </div>
      </Alert>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <Alert className={cn('border-red-500/20 bg-red-50 dark:bg-red-900/10', className)}>
        <div className="relative">
          <div className="flex items-start gap-3 sm:gap-4">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between items-start gap-2">
                <AlertTitle className="text-base sm:text-lg text-red-800 dark:text-red-200">
                  Payment Failed
                </AlertTitle>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 -mt-1 -mr-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={onClose}
                    aria-label="Close error message"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <AlertDescription className="text-sm sm:text-base text-red-700 dark:text-red-300 space-y-3">
                <p>{error || 'An unknown error occurred while processing your payment.'}</p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900/30"
                    >
                      Try Again
                    </Button>
                  )}
                  {onClose && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-red-700 hover:bg-red-100 dark:text-red-200 dark:hover:bg-red-900/30"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </div>
          </div>
          {onClose && !onRetry && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 p-0 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
              onClick={onClose}
              aria-label="Close error message"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  return null;
};

export default PaymentStatus;
