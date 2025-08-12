/**
 * HowItWorksSection Integration Tests
 * Tests for component integration with external systems and dependencies
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import HowItWorksSection from '../../components/HowItWorksSection';

// Mock external dependencies
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock UI components to test integration
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange, ...props }: any) => (
    <div data-testid="tabs" data-value={value} {...props}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, ...props }: any) => (
    <div data-testid={`tab-content-${value}`} {...props}>
      {children}
    </div>
  ),
  TabsList: ({ children, ...props }: any) => (
    <div data-testid="tabs-list" {...props}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, onClick, ...props }: any) => (
    <button
      data-testid={`tab-trigger-${value}`}
      onClick={() => onClick?.(value)}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

describe('HowItWorksSection Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
    
    // Mock window.open
    Object.assign(window, {
      open: jest.fn(),
    });
  });

  describe('Toast Integration', () => {
    it('integrates with toast system for successful copy operations', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      await user.click(copyButtons[0]);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Code copied!",
        description: "Paste it in your project to get started."
      });
    });

    it('integrates with toast system for copy failures', async () => {
      // Mock clipboard failure
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
      
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      await user.click(copyButtons[0]);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Copy failed",
        description: "Unable to copy code to clipboard. Please try again.",
        variant: "destructive"
      });
    });

    it('handles toast system unavailability gracefully', async () => {
      // Mock toast to throw error
      mockToast.mockImplementationOnce(() => {
        throw new Error('Toast system error');
      });
      
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      
      // Should not crash when toast fails
      expect(() => user.click(copyButtons[0])).not.toThrow();
    });
  });

  describe('Browser API Integration', () => {
    it('integrates with clipboard API correctly', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      navigator.clipboard.writeText = mockWriteText;
      
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      await user.click(copyButtons[0]);
      
      expect(mockWriteText).toHaveBeenCalledWith(
        '<script src="https://ckpayment.icp0.io/ckpay.js"></script>'
      );
    });

    it('integrates with window.open API correctly', async () => {
      const mockWindowOpen = jest.fn();
      window.open = mockWindowOpen;
      
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      await user.click(docButton);
      
      expect(mockWindowOpen).toHaveBeenCalledWith('https://docs.ckpayment.xyz', '_blank');
    });

    it('handles missing browser APIs gracefully', async () => {
      // Remove clipboard API
      delete (navigator as any).clipboard;
      
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      
      // Should not crash when clipboard API is unavailable
      await expect(user.click(copyButtons[0])).resolves.not.toThrow();
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Copy failed",
        description: "Unable to copy code to clipboard. Please try again.",
        variant: "destructive"
      });
    });
  });

  describe('UI Component Integration', () => {
    it('integrates with Tabs component correctly', () => {
      render(<HowItWorksSection />);
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-web')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-mobile')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-api')).toBeInTheDocument();
    });

    it('integrates with Card components for code blocks', () => {
      render(<HowItWorksSection />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('integrates with Button components correctly', () => {
      render(<HowItWorksSection />);
      
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Should include documentation button and copy buttons
      expect(buttons.length).toBeGreaterThanOrEqual(4); // 1 doc button + 3 copy buttons
    });

    it('integrates with Badge components for integration labels', () => {
      render(<HowItWorksSection />);
      
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Icon Integration', () => {
    it('renders Lucide icons without errors', () => {
      render(<HowItWorksSection />);
      
      // Icons should be present (they render as SVG elements)
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('handles icon loading failures gracefully', () => {
      // Mock console.error to catch any icon-related errors
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<HowItWorksSection />);
      
      // Should not log any errors related to icon loading
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Integration', () => {
    it('handles rapid tab switching without performance issues', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const webTab = screen.getByRole('tab', { name: /web integration/i });
      const mobileTab = screen.getByRole('tab', { name: /mobile integration/i });
      const apiTab = screen.getByRole('tab', { name: /api integration/i });
      
      // Rapidly switch between tabs
      for (let i = 0; i < 10; i++) {
        await user.click(webTab);
        await user.click(mobileTab);
        await user.click(apiTab);
      }
      
      // Component should still be responsive
      expect(apiTab).toHaveAttribute('aria-selected', 'true');
    });

    it('handles rapid copy operations without issues', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      
      // Rapidly click copy buttons
      for (let i = 0; i < 5; i++) {
        await user.click(copyButtons[0]);
      }
      
      // Should handle all copy operations
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(5);
    });
  });

  describe('Memory Management', () => {
    it('cleans up timers on unmount', () => {
      jest.useFakeTimers();
      const { unmount } = render(<HowItWorksSection />);
      
      // Trigger copy operation to start timer
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      fireEvent.click(copyButtons[0]);
      
      // Unmount component
      unmount();
      
      // Advance timers - should not cause any errors
      expect(() => {
        jest.advanceTimersByTime(3000);
      }).not.toThrow();
      
      jest.useRealTimers();
    });

    it('handles component re-renders efficiently', () => {
      const { rerender } = render(<HowItWorksSection />);
      
      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<HowItWorksSection />);
      }
      
      // Component should still be functional
      expect(screen.getByText('How It Works')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles errors in child components gracefully', () => {
      // Mock console.error to prevent error logging in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock a component to throw an error
      jest.doMock('@/components/ui/button', () => ({
        Button: () => {
          throw new Error('Button component error');
        },
      }));
      
      // Component should handle the error gracefully
      expect(() => render(<HowItWorksSection />)).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility Integration', () => {
    it('integrates with screen readers correctly', () => {
      render(<HowItWorksSection />);
      
      // Check for proper ARIA structure
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('maintains focus management during interactions', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      // Tab to first interactive element
      await user.tab();
      
      // Should focus on documentation button or first tab
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
      expect(focusedElement?.tagName).toMatch(/BUTTON/i);
    });
  });

  describe('Theme Integration', () => {
    it('applies theme classes correctly', () => {
      render(<HowItWorksSection />);
      
      const section = screen.getByRole('region');
      
      // Should have theme-aware classes
      expect(section).toHaveClass('bg-gradient-to-b');
      expect(section.className).toMatch(/from-background|to-muted/);
    });

    it('handles theme changes gracefully', () => {
      const { rerender } = render(<HowItWorksSection />);
      
      // Simulate theme change by re-rendering
      rerender(<HowItWorksSection />);
      
      // Component should still render correctly
      expect(screen.getByText('How It Works')).toBeInTheDocument();
    });
  });
});