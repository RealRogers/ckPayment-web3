/**
 * HowItWorksSection Component Tests
 * Comprehensive test suite for the enhanced HowItWorksSection component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import HowItWorksSection from '../HowItWorksSection';

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock window.open
const mockWindowOpen = jest.fn();
Object.assign(window, {
  open: mockWindowOpen,
});

describe('HowItWorksSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('renders the main section with correct structure', () => {
      render(<HowItWorksSection />);
      
      // Check main section
      const section = screen.getByRole('region', { name: /how it works/i });
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'how-it-works');
      
      // Check header elements
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Simple Integration,')).toBeInTheDocument();
      expect(screen.getByText('Powerful Results')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view documentation/i })).toBeInTheDocument();
    });

    it('renders all three integration tabs', () => {
      render(<HowItWorksSection />);
      
      expect(screen.getByRole('tab', { name: /web integration/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /mobile integration/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /api integration/i })).toBeInTheDocument();
    });

    it('renders web integration as default active tab', () => {
      render(<HowItWorksSection />);
      
      const webTab = screen.getByRole('tab', { name: /web integration/i });
      expect(webTab).toHaveAttribute('aria-selected', 'true');
      
      // Check if web integration content is visible
      expect(screen.getByText('Perfect for websites and web applications')).toBeInTheDocument();
    });

    it('renders all step elements for active tab', () => {
      render(<HowItWorksSection />);
      
      // Check timeline steps (web integration has 3 steps)
      expect(screen.getByLabelText('Step 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Step 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Step 3')).toBeInTheDocument();
      
      // Check step titles
      expect(screen.getByText('Add the Script')).toBeInTheDocument();
      expect(screen.getByText('Initialize')).toBeInTheDocument();
      expect(screen.getByText('Create Payment')).toBeInTheDocument();
    });

    it('renders features section for active tab', () => {
      render(<HowItWorksSection />);
      
      expect(screen.getByText('Key Features')).toBeInTheDocument();
      expect(screen.getByText('Browser-native')).toBeInTheDocument();
      expect(screen.getByText('No dependencies')).toBeInTheDocument();
      expect(screen.getByText('Real-time updates')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches to mobile tab when clicked', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const mobileTab = screen.getByRole('tab', { name: /mobile integration/i });
      await user.click(mobileTab);
      
      expect(mobileTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Cross-platform SDK for React Native')).toBeInTheDocument();
      expect(screen.getByText('Cross-platform')).toBeInTheDocument();
      expect(screen.getByText('Offline support')).toBeInTheDocument();
    });

    it('switches to API tab when clicked', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const apiTab = screen.getByRole('tab', { name: /api integration/i });
      await user.click(apiTab);
      
      expect(apiTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Server-side REST API for secure backend')).toBeInTheDocument();
      expect(screen.getByText('Secure server-side')).toBeInTheDocument();
      expect(screen.getByText('Webhook support')).toBeInTheDocument();
    });

    it('updates step content when switching tabs', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      // Initially on web tab
      expect(screen.getByText('Add the Script')).toBeInTheDocument();
      
      // Switch to mobile tab
      await user.click(screen.getByRole('tab', { name: /mobile integration/i }));
      expect(screen.getByText('Install SDK')).toBeInTheDocument();
      expect(screen.queryByText('Add the Script')).not.toBeInTheDocument();
      
      // Switch to API tab
      await user.click(screen.getByRole('tab', { name: /api integration/i }));
      expect(screen.getByText('Get API Key')).toBeInTheDocument();
      expect(screen.queryByText('Install SDK')).not.toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('copies code to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      await user.click(copyButtons[0]);
      
      expect(mockWriteText).toHaveBeenCalledWith(
        '<script src="https://ckpayment.icp0.io/ckpay.js"></script>'
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: "Code copied!",
        description: "Paste it in your project to get started."
      });
    });

    it('shows copied feedback with checkmark icon', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      await user.click(copyButtons[0]);
      
      // Check for copied popup
      expect(screen.getByText('Copied!')).toBeInTheDocument();
      
      // Fast-forward time to check if popup disappears
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
      });
    });

    it('handles copy failure gracefully', async () => {
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard not available'));
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

    it('copies different code for different steps', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      
      // Copy first step
      await user.click(copyButtons[0]);
      expect(mockWriteText).toHaveBeenLastCalledWith(
        '<script src="https://ckpayment.icp0.io/ckpay.js"></script>'
      );
      
      // Copy second step
      await user.click(copyButtons[1]);
      expect(mockWriteText).toHaveBeenLastCalledWith(
        'ckPayment.init({\n  canisterId: "your-canister-id",\n  theme: "light",\n  currency: "ckBTC"\n})'
      );
    });
  });

  describe('Documentation Button', () => {
    it('opens documentation in new tab when clicked', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      await user.click(docButton);
      
      expect(mockWindowOpen).toHaveBeenCalledWith('https://docs.ckpayment.xyz', '_blank');
    });
  });

  describe('Accessibility Features', () => {
    it('has proper ARIA labels and roles', () => {
      render(<HowItWorksSection />);
      
      // Check main section accessibility
      expect(screen.getByRole('region', { name: /how it works/i })).toBeInTheDocument();
      
      // Check tab accessibility
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Choose integration method');
      
      // Check tab panels
      expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
      
      // Check step list accessibility
      const stepsList = screen.getByRole('list', { name: /integration steps/i });
      expect(stepsList).toBeInTheDocument();
      
      // Check features list accessibility
      const featuresList = screen.getByRole('list', { name: /key features/i });
      expect(featuresList).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      // Tab to the first tab
      await user.tab();
      expect(screen.getByRole('tab', { name: /web integration/i })).toHaveFocus();
      
      // Navigate to next tab with arrow keys
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /mobile integration/i })).toHaveFocus();
    });

    it('has proper focus indicators', () => {
      render(<HowItWorksSection />);
      
      // Check that focusable elements have focus styles
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      expect(docButton).toHaveClass('focus:ring-2', 'focus:ring-primary/50', 'focus:outline-none');
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      copyButtons.forEach(button => {
        expect(button).toHaveClass('focus:ring-2', 'focus:ring-primary/50', 'focus:outline-none');
      });
    });

    it('provides screen reader friendly content', () => {
      render(<HowItWorksSection />);
      
      // Check for aria-hidden on decorative icons
      const decorativeIcons = screen.getAllByRole('img', { hidden: true });
      expect(decorativeIcons.length).toBeGreaterThan(0);
      
      // Check for descriptive labels
      expect(screen.getByLabelText(/view documentation in new tab/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/copy.*code for/i).length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('renders mobile-friendly tab layout', () => {
      render(<HowItWorksSection />);
      
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('grid-cols-1', 'sm:grid-cols-3');
    });

    it('adapts text sizes for different screen sizes', () => {
      render(<HowItWorksSection />);
      
      const mainTitle = screen.getByText('Simple Integration,');
      expect(mainTitle).toHaveClass('text-3xl', 'md:text-5xl');
      
      const description = screen.getByText(/Get started with ckPayment in minutes/);
      expect(description).toHaveClass('text-lg', 'md:text-xl');
    });

    it('shows responsive timeline elements', () => {
      render(<HowItWorksSection />);
      
      const timelineCircles = screen.getAllByLabelText(/step \d/i);
      timelineCircles.forEach(circle => {
        expect(circle).toHaveClass('w-10', 'h-10', 'sm:w-12', 'sm:h-12');
      });
    });
  });

  describe('Visual Feedback and Animations', () => {
    it('applies hover effects to interactive elements', () => {
      render(<HowItWorksSection />);
      
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      expect(docButton).toHaveClass('hover:scale-105', 'transition-all', 'duration-300');
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      copyButtons.forEach(button => {
        expect(button).toHaveClass('hover:scale-110', 'transition-all', 'duration-300');
      });
    });

    it('shows proper loading states during copy operation', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<HowItWorksSection />);
      
      const copyButton = screen.getAllByLabelText(/copy.*code/i)[0];
      await user.click(copyButton);
      
      // Should show checkmark immediately after successful copy
      const checkIcon = copyButton.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
      
      // Should revert after timeout
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        const copyIcon = copyButton.querySelector('svg');
        expect(copyIcon).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing clipboard API gracefully', async () => {
      // Remove clipboard API
      const originalClipboard = navigator.clipboard;
      delete (navigator as any).clipboard;
      
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const copyButton = screen.getAllByLabelText(/copy.*code/i)[0];
      await user.click(copyButton);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Copy failed",
        description: "Unable to copy code to clipboard. Please try again.",
        variant: "destructive"
      });
      
      // Restore clipboard API
      (navigator as any).clipboard = originalClipboard;
    });

    it('handles window.open failure gracefully', async () => {
      mockWindowOpen.mockImplementationOnce(() => null);
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      await user.click(docButton);
      
      // Should still attempt to open
      expect(mockWindowOpen).toHaveBeenCalledWith('https://docs.ckpayment.xyz', '_blank');
    });
  });

  describe('Integration Data Validation', () => {
    it('displays correct integration information for each tab', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      // Web integration
      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('1 minute')).toBeInTheDocument();
      expect(screen.getByText('Recommended')).toBeInTheDocument();
      
      // Switch to mobile
      await user.click(screen.getByRole('tab', { name: /mobile integration/i }));
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
      expect(screen.getByText('3 minutes')).toBeInTheDocument();
      expect(screen.getByText('Mobile-First')).toBeInTheDocument();
      
      // Switch to API
      await user.click(screen.getByRole('tab', { name: /api integration/i }));
      expect(screen.getByText('Advanced')).toBeInTheDocument();
      expect(screen.getByText('5 minutes')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('shows correct code examples for each integration type', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      // Web integration - HTML and JavaScript
      expect(screen.getByText('HTML')).toBeInTheDocument();
      expect(screen.getAllByText('JavaScript')).toHaveLength(2);
      
      // Switch to mobile
      await user.click(screen.getByRole('tab', { name: /mobile integration/i }));
      expect(screen.getByText('Shell')).toBeInTheDocument();
      expect(screen.getAllByText('JavaScript')).toHaveLength(2);
      
      // Switch to API
      await user.click(screen.getByRole('tab', { name: /api integration/i }));
      expect(screen.getAllByText('cURL')).toHaveLength(3);
    });
  });
});