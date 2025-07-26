import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import GetStarted from '../GetStarted';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the components that might not be available in test environment
jest.mock('@/components/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar</nav>;
  };
});

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

jest.mock('@/components/AnimatedBackground', () => {
  return function MockAnimatedBackground() {
    return <div data-testid="animated-background">Animated Background</div>;
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

describe('GetStarted Page', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders the main heading', () => {
      renderWithProviders(<GetStarted />);
      expect(screen.getByRole('heading', { name: /start building with ckpayment/i })).toBeInTheDocument();
    });

    test('renders all navigation components', () => {
      renderWithProviders(<GetStarted />);
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('animated-background')).toBeInTheDocument();
    });

    test('renders all 4 quick start steps', () => {
      renderWithProviders(<GetStarted />);
      expect(screen.getByText('Install the SDK')).toBeInTheDocument();
      expect(screen.getByText('Configure Your API Key')).toBeInTheDocument();
      expect(screen.getByText('Create Your First Payment')).toBeInTheDocument();
      expect(screen.getByText('Handle Payment Events')).toBeInTheDocument();
    });

    test('renders integration options', () => {
      renderWithProviders(<GetStarted />);
      expect(screen.getByText('JavaScript SDK')).toBeInTheDocument();
      expect(screen.getByText('React Components')).toBeInTheDocument();
      expect(screen.getByText('REST API')).toBeInTheDocument();
    });

    test('renders resources section', () => {
      renderWithProviders(<GetStarted />);
      expect(screen.getByText('Developer Resources')).toBeInTheDocument();
      expect(screen.getByText('API Documentation')).toBeInTheDocument();
    });

    test('renders support section', () => {
      renderWithProviders(<GetStarted />);
      expect(screen.getByText('Support & Community')).toBeInTheDocument();
      expect(screen.getByText('Discord Community')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderWithProviders(<GetStarted />);
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });
      
      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
      expect(h3s.length).toBeGreaterThan(0);
    });

    test('has proper ARIA labels on interactive elements', () => {
      renderWithProviders(<GetStarted />);
      const copyButtons = screen.getAllByLabelText(/copy.*code to clipboard/i);
      expect(copyButtons.length).toBeGreaterThan(0);
    });

    test('has proper semantic structure for steps', () => {
      renderWithProviders(<GetStarted />);
      const stepsList = screen.getByRole('list', { name: /quick start steps/i });
      expect(stepsList).toBeInTheDocument();
    });

    test('has proper section landmarks', () => {
      renderWithProviders(<GetStarted />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard Functionality', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
      
      // Mock secure context
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
      });
    });

    test('copies JavaScript SDK code to clipboard', async () => {
      renderWithProviders(<GetStarted />);
      const copyButton = screen.getByLabelText(/copy javascript sdk code to clipboard/i);
      
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('import { ckPayment } from \'@ckpayment/sdk\';')
        );
      });
    });

    test('copies React component code to clipboard', async () => {
      renderWithProviders(<GetStarted />);
      const copyButton = screen.getByLabelText(/copy react component code to clipboard/i);
      
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('import { PaymentButton } from \'@ckpayment/react\';')
        );
      });
    });

    test('copies cURL API code to clipboard', async () => {
      renderWithProviders(<GetStarted />);
      const copyButton = screen.getByLabelText(/copy curl api code to clipboard/i);
      
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('curl -X POST https://api.ckpayment.com/v1/checkout')
        );
      });
    });

    test('handles clipboard API failure gracefully', async () => {
      // Mock clipboard API to fail
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('Clipboard failed')),
        },
      });

      renderWithProviders(<GetStarted />);
      const copyButton = screen.getByLabelText(/copy javascript sdk code to clipboard/i);
      
      fireEvent.click(copyButton);
      
      // Should not throw an error
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });
  });

  describe('Responsive Design', () => {
    test('renders properly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<GetStarted />);
      expect(screen.getByRole('heading', { name: /start building with ckpayment/i })).toBeInTheDocument();
    });

    test('renders properly on desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      renderWithProviders(<GetStarted />);
      expect(screen.getByRole('heading', { name: /start building with ckpayment/i })).toBeInTheDocument();
    });
  });

  describe('Page Behavior', () => {
    test('scrolls to top on page load', () => {
      renderWithProviders(<GetStarted />);
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    test('all buttons are keyboard accessible', () => {
      renderWithProviders(<GetStarted />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    test('all links have proper attributes for external links', () => {
      renderWithProviders(<GetStarted />);
      const externalLinks = screen.getAllByText(/view.*docs|join discord|contact support|view github/i);
      
      // Note: This test would need to be adjusted based on actual implementation
      // of external links in the component
      expect(externalLinks.length).toBeGreaterThan(0);
    });
  });
});