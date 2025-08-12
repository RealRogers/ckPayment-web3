/**
 * HowItWorksSection Visual Regression Tests
 * Tests for visual consistency and styling validation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import HowItWorksSection from '../../components/HowItWorksSection';

// Mock dependencies for consistent testing
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('HowItWorksSection Visual Tests', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct section structure', () => {
      render(<HowItWorksSection />);
      
      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-16', 'md:py-24');
      expect(section).toHaveClass('bg-gradient-to-b');
      expect(section).toHaveClass('relative', 'overflow-hidden');
    });

    it('has proper container structure', () => {
      render(<HowItWorksSection />);
      
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('mx-auto', 'px-4', 'relative', 'z-10');
    });

    it('maintains header layout structure', () => {
      render(<HowItWorksSection />);
      
      const headerContainer = document.querySelector('.max-w-6xl');
      expect(headerContainer).toBeInTheDocument();
      expect(headerContainer).toHaveClass('mx-auto', 'text-center', 'mb-16');
    });

    it('has proper tabs container structure', () => {
      render(<HowItWorksSection />);
      
      const tabsContainer = document.querySelector('.max-w-4xl');
      expect(tabsContainer).toBeInTheDocument();
      expect(tabsContainer).toHaveClass('mx-auto');
    });
  });

  describe('Background and Decorative Elements', () => {
    it('renders background decorations correctly', () => {
      render(<HowItWorksSection />);
      
      // Check for background gradient overlay
      const gradientOverlay = document.querySelector('.absolute.inset-0.bg-gradient-to-r');
      expect(gradientOverlay).toBeInTheDocument();
      expect(gradientOverlay).toHaveClass('from-primary/5', 'via-transparent', 'to-accent/5');
      
      // Check for decorative blur elements
      const blurElements = document.querySelectorAll('.absolute.bg-primary\\/10.rounded-full.blur-3xl');
      expect(blurElements.length).toBeGreaterThanOrEqual(1);
    });

    it('applies correct z-index layering', () => {
      render(<HowItWorksSection />);
      
      const mainContainer = document.querySelector('.relative.z-10');
      expect(mainContainer).toBeInTheDocument();
      
      const backgroundElements = document.querySelectorAll('.pointer-events-none');
      expect(backgroundElements.length).toBeGreaterThan(0);
    });
  });

  describe('Header Styling', () => {
    it('applies correct badge styling', () => {
      render(<HowItWorksSection />);
      
      const badge = screen.getByText('How It Works').parentElement;
      expect(badge).toHaveClass('inline-flex', 'items-center', 'gap-2');
      expect(badge).toHaveClass('bg-gradient-to-r', 'from-primary/15', 'to-primary/10');
      expect(badge).toHaveClass('text-primary', 'px-4', 'py-2', 'rounded-full');
      expect(badge).toHaveClass('border', 'border-primary/20', 'shadow-sm');
    });

    it('applies correct title styling', () => {
      render(<HowItWorksSection />);
      
      const title = screen.getByText('Simple Integration,');
      expect(title).toHaveClass('text-3xl', 'md:text-5xl', 'font-bold', 'text-foreground', 'mb-6');
      
      const gradientText = screen.getByText('Powerful Results');
      expect(gradientText).toHaveClass('bg-gradient-to-r', 'from-primary', 'to-accent');
      expect(gradientText).toHaveClass('bg-clip-text', 'text-transparent');
    });

    it('applies correct description styling', () => {
      render(<HowItWorksSection />);
      
      const description = screen.getByText(/Get started with ckPayment in minutes/);
      expect(description).toHaveClass('text-lg', 'md:text-xl', 'text-muted-foreground');
      expect(description).toHaveClass('max-w-3xl', 'mx-auto', 'leading-relaxed', 'mb-6');
    });

    it('applies correct documentation button styling', () => {
      render(<HowItWorksSection />);
      
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      expect(docButton).toHaveClass('border-primary/30', 'text-primary');
      expect(docButton).toHaveClass('hover:bg-gradient-to-r', 'hover:from-primary/10', 'hover:to-primary/5');
      expect(docButton).toHaveClass('hover:border-primary/50', 'hover:shadow-lg', 'hover:scale-105');
      expect(docButton).toHaveClass('focus:ring-2', 'focus:ring-primary/50', 'focus:outline-none');
      expect(docButton).toHaveClass('transition-all', 'duration-300', 'group');
    });
  });

  describe('Tab System Styling', () => {
    it('applies correct tabs list styling', () => {
      render(<HowItWorksSection />);
      
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('grid', 'w-full', 'grid-cols-1', 'sm:grid-cols-3');
      expect(tabsList).toHaveClass('mb-8', 'h-auto', 'gap-2', 'sm:gap-0');
      expect(tabsList).toHaveClass('bg-gradient-to-r', 'from-muted/60', 'via-muted/50', 'to-muted/60');
      expect(tabsList).toHaveClass('p-1', 'rounded-xl', 'border', 'border-border/50');
      expect(tabsList).toHaveClass('shadow-sm', 'backdrop-blur-sm');
    });

    it('applies correct tab trigger styling', () => {
      render(<HowItWorksSection />);
      
      const webTab = screen.getByRole('tab', { name: /web integration/i });
      expect(webTab).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'items-center');
      expect(webTab).toHaveClass('gap-1', 'sm:gap-2', 'p-3', 'sm:p-4', 'h-auto');
      expect(webTab).toHaveClass('min-h-[60px]', 'sm:min-h-[80px]');
      expect(webTab).toHaveClass('focus:ring-2', 'focus:ring-primary/50', 'focus:outline-none');
      expect(webTab).toHaveClass('transition-all', 'duration-300', 'rounded-lg', 'group');
    });

    it('applies active tab styling correctly', async () => {
      const user = userEvent.setup();
      render(<HowItWorksSection />);
      
      const webTab = screen.getByRole('tab', { name: /web integration/i });
      
      // Web tab should be active by default
      expect(webTab).toHaveClass('bg-gradient-to-r', 'from-primary/15', 'to-primary/10');
      expect(webTab).toHaveClass('text-primary', 'border', 'border-primary/20', 'shadow-md');
      
      // Switch to mobile tab
      const mobileTab = screen.getByRole('tab', { name: /mobile integration/i });
      await user.click(mobileTab);
      
      expect(mobileTab).toHaveClass('bg-gradient-to-r', 'from-primary/15', 'to-primary/10');
    });
  });

  describe('Tab Content Styling', () => {
    it('applies correct tab panel styling', () => {
      render(<HowItWorksSection />);
      
      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toHaveAttribute('tabindex', '0');
    });

    it('applies correct per-tab header styling', () => {
      render(<HowItWorksSection />);
      
      const headerSection = document.querySelector('.text-center.space-y-4.pb-6');
      expect(headerSection).toBeInTheDocument();
      expect(headerSection).toHaveClass('border-b', 'border-gradient-to-r');
      
      const iconContainer = document.querySelector('.w-16.h-16.sm\\:w-20.sm\\:h-20.rounded-2xl');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('bg-gradient-to-br', 'from-primary/15', 'via-primary/10', 'to-primary/5');
      expect(iconContainer).toHaveClass('shadow-lg', 'border', 'border-primary/20');
    });

    it('applies correct badge styling in tab headers', () => {
      render(<HowItWorksSection />);
      
      const badge = screen.getByText('Recommended');
      expect(badge).toHaveClass('bg-gradient-to-r', 'from-primary/15', 'to-primary/10');
      expect(badge).toHaveClass('text-primary', 'border-primary/20');
      expect(badge).toHaveClass('text-xs', 'sm:text-sm', 'shadow-sm');
    });

    it('applies correct difficulty and time indicator styling', () => {
      render(<HowItWorksSection />);
      
      const difficultyIndicator = screen.getByText('Difficulty: Beginner').parentElement;
      expect(difficultyIndicator).toHaveClass('flex', 'items-center', 'gap-2');
      expect(difficultyIndicator).toHaveClass('px-3', 'py-1', 'rounded-full');
      expect(difficultyIndicator).toHaveClass('bg-muted/30', 'border', 'border-border/30');
    });
  });

  describe('Timeline Styling', () => {
    it('applies correct timeline container styling', () => {
      render(<HowItWorksSection />);
      
      const timelineContainer = screen.getByRole('list', { name: /integration steps/i });
      expect(timelineContainer).toHaveClass('relative');
    });

    it('applies correct timeline circle styling', () => {
      render(<HowItWorksSection />);
      
      const timelineCircle = screen.getByLabelText('Step 1');
      expect(timelineCircle).toHaveClass('w-10', 'h-10', 'sm:w-12', 'sm:h-12', 'rounded-full');
      expect(timelineCircle).toHaveClass('bg-gradient-to-br', 'from-green-400', 'to-green-600');
      expect(timelineCircle).toHaveClass('text-white', 'flex', 'items-center', 'justify-center');
      expect(timelineCircle).toHaveClass('font-semibold', 'text-sm', 'sm:text-base', 'z-10');
      expect(timelineCircle).toHaveClass('shadow-lg', 'border-2', 'border-green-300/50');
      expect(timelineCircle).toHaveClass('hover:shadow-xl', 'hover:scale-110');
      expect(timelineCircle).toHaveClass('transition-all', 'duration-300');
    });

    it('applies correct connecting line styling', () => {
      render(<HowItWorksSection />);
      
      const connectingLines = document.querySelectorAll('.w-0\\.5.bg-gradient-to-b');
      expect(connectingLines.length).toBeGreaterThan(0);
      
      connectingLines.forEach(line => {
        expect(line).toHaveClass('from-green-300/50', 'via-border/30', 'to-green-300/50');
        expect(line).toHaveClass('mt-2', 'absolute', 'z-0');
      });
    });
  });

  describe('Code Block Styling', () => {
    it('applies correct card styling for code blocks', () => {
      render(<HowItWorksSection />);
      
      const codeCards = document.querySelectorAll('[data-testid="card"]');
      expect(codeCards.length).toBeGreaterThan(0);
      
      codeCards.forEach(card => {
        expect(card).toHaveClass('relative', 'group');
        expect(card).toHaveClass('hover:border-primary/40', 'hover:shadow-xl', 'hover:shadow-primary/10');
        expect(card).toHaveClass('hover:-translate-y-1', 'transition-all', 'duration-300');
        expect(card).toHaveClass('bg-gradient-to-br', 'from-card/80', 'via-card/60', 'to-card/80');
        expect(card).toHaveClass('backdrop-blur-sm', 'border', 'border-border/50', 'min-w-0');
      });
    });

    it('applies correct language label styling', () => {
      render(<HowItWorksSection />);
      
      const languageLabel = screen.getByText('HTML');
      expect(languageLabel).toHaveClass('absolute', 'top-3', 'left-3');
      expect(languageLabel).toHaveClass('text-xs', 'font-mono', 'text-muted-foreground');
      expect(languageLabel).toHaveClass('bg-gradient-to-r', 'from-background/95', 'to-background/90');
      expect(languageLabel).toHaveClass('px-2', 'py-1', 'rounded', 'border', 'border-border/50');
      expect(languageLabel).toHaveClass('z-20', 'shadow-sm');
    });

    it('applies correct copy button styling', () => {
      render(<HowItWorksSection />);
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      expect(copyButtons.length).toBeGreaterThan(0);
      
      copyButtons.forEach(button => {
        expect(button).toHaveClass('h-8', 'w-8');
        expect(button).toHaveClass('hover:bg-gradient-to-r', 'hover:from-primary/20', 'hover:to-primary/10');
        expect(button).toHaveClass('hover:scale-110', 'transition-all', 'duration-300');
        expect(button).toHaveClass('opacity-70', 'group-hover:opacity-100');
        expect(button).toHaveClass('focus:ring-2', 'focus:ring-primary/50', 'focus:outline-none');
        expect(button).toHaveClass('shadow-sm');
      });
    });

    it('applies correct code content styling', () => {
      render(<HowItWorksSection />);
      
      const codeBlocks = document.querySelectorAll('pre');
      expect(codeBlocks.length).toBeGreaterThan(0);
      
      codeBlocks.forEach(pre => {
        expect(pre).toHaveClass('p-4', 'pt-10', 'pb-4', 'rounded-lg', 'overflow-x-auto');
        expect(pre).toHaveClass('text-xs', 'sm:text-sm', 'text-foreground/90', 'leading-relaxed');
        expect(pre).toHaveClass('bg-gradient-to-br', 'from-muted/20', 'to-muted/10');
        expect(pre).toHaveClass('border', 'border-border/20');
        expect(pre).toHaveClass('group-hover:bg-gradient-to-br', 'group-hover:from-muted/30', 'group-hover:to-muted/20');
        expect(pre).toHaveClass('transition-all', 'duration-300');
      });
    });
  });

  describe('Features Section Styling', () => {
    it('applies correct features container styling', () => {
      render(<HowItWorksSection />);
      
      const featuresContainer = document.querySelector('.mt-8.pt-6.border-t');
      expect(featuresContainer).toBeInTheDocument();
      expect(featuresContainer).toHaveClass('border-gradient-to-r', 'from-transparent', 'via-border/50', 'to-transparent');
      
      const featuresBox = featuresContainer?.querySelector('.bg-gradient-to-br');
      expect(featuresBox).toBeInTheDocument();
      expect(featuresBox).toHaveClass('from-muted/40', 'via-muted/30', 'to-muted/40');
      expect(featuresBox).toHaveClass('rounded-xl', 'p-4', 'sm:p-6');
      expect(featuresBox).toHaveClass('border', 'border-border/30', 'shadow-sm');
      expect(featuresBox).toHaveClass('hover:shadow-md', 'transition-all', 'duration-300', 'backdrop-blur-sm');
    });

    it('applies correct feature item styling', () => {
      render(<HowItWorksSection />);
      
      const featureItems = screen.getAllByRole('listitem');
      const featuresListItems = featureItems.filter(item => 
        item.textContent?.includes('Browser-native') || 
        item.textContent?.includes('No dependencies') || 
        item.textContent?.includes('Real-time updates')
      );
      
      expect(featuresListItems.length).toBeGreaterThan(0);
      
      featuresListItems.forEach(item => {
        expect(item).toHaveClass('flex', 'items-center', 'gap-2');
        expect(item).toHaveClass('text-sm', 'sm:text-base', 'text-muted-foreground');
        expect(item).toHaveClass('justify-center', 'sm:justify-start');
        expect(item).toHaveClass('px-3', 'py-2', 'rounded-lg');
        expect(item).toHaveClass('bg-background/50', 'border', 'border-border/30');
        expect(item).toHaveClass('hover:bg-background/70', 'hover:border-primary/20', 'hover:text-foreground');
        expect(item).toHaveClass('transition-all', 'duration-300', 'group');
      });
    });
  });

  describe('Responsive Design Validation', () => {
    it('applies correct responsive classes throughout', () => {
      render(<HowItWorksSection />);
      
      // Check responsive padding
      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-16', 'md:py-24');
      
      // Check responsive text sizes
      const title = screen.getByText('Simple Integration,');
      expect(title).toHaveClass('text-3xl', 'md:text-5xl');
      
      // Check responsive grid
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('grid-cols-1', 'sm:grid-cols-3');
      
      // Check responsive gaps
      expect(tabsList).toHaveClass('gap-2', 'sm:gap-0');
    });

    it('maintains proper spacing across breakpoints', () => {
      render(<HowItWorksSection />);
      
      // Check responsive margins and padding
      const headerContainer = document.querySelector('.max-w-6xl');
      expect(headerContainer).toHaveClass('mb-16');
      
      const tabsContainer = document.querySelector('.max-w-4xl');
      expect(tabsContainer).toBeInTheDocument();
      
      // Check responsive icon sizes
      const timelineCircles = screen.getAllByLabelText(/step \d/i);
      timelineCircles.forEach(circle => {
        expect(circle).toHaveClass('w-10', 'h-10', 'sm:w-12', 'sm:h-12');
      });
    });
  });

  describe('Animation and Transition Classes', () => {
    it('applies consistent transition classes', () => {
      render(<HowItWorksSection />);
      
      // Check documentation button transitions
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      expect(docButton).toHaveClass('transition-all', 'duration-300');
      
      // Check tab trigger transitions
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('transition-all', 'duration-300');
      });
      
      // Check timeline circle transitions
      const timelineCircles = screen.getAllByLabelText(/step \d/i);
      timelineCircles.forEach(circle => {
        expect(circle).toHaveClass('transition-all', 'duration-300');
      });
    });

    it('applies hover effect classes correctly', () => {
      render(<HowItWorksSection />);
      
      // Check hover scale effects
      const docButton = screen.getByRole('button', { name: /view documentation/i });
      expect(docButton).toHaveClass('hover:scale-105');
      
      const timelineCircles = screen.getAllByLabelText(/step \d/i);
      timelineCircles.forEach(circle => {
        expect(circle).toHaveClass('hover:scale-110');
      });
      
      const copyButtons = screen.getAllByLabelText(/copy.*code/i);
      copyButtons.forEach(button => {
        expect(button).toHaveClass('hover:scale-110');
      });
    });
  });
});