import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsletterSection from '@/components/home/NewsletterSection';

// ── framer-motion stub ────────────────────────────────────────────────────────
// next/jest transforms the module but framer-motion's animation hooks
// don't play well in jsdom; we stub it so renders are synchronous.
jest.mock('framer-motion', () => {
    const actual = jest.requireActual('framer-motion');
    return {
        ...actual,
        motion: {
            div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
                React.createElement('div', props, children),
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    };
});

describe('NewsletterSection component', () => {
    it('renders the section heading', () => {
        render(<NewsletterSection />);
        expect(screen.getByText(/Stay Ahead of Every Trend/i)).toBeInTheDocument();
    });

    it('renders the email input field', () => {
        render(<NewsletterSection />);
        expect(screen.getByPlaceholderText(/Your email address/i)).toBeInTheDocument();
    });

    it('renders the Subscribe button', () => {
        render(<NewsletterSection />);
        expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
    });

    it('renders the no-spam disclaimer', () => {
        render(<NewsletterSection />);
        expect(screen.getByText(/No spam, ever/i)).toBeInTheDocument();
    });

    it('shows success state after submitting a valid email', async () => {
        render(<NewsletterSection />);
        const emailInput = screen.getByPlaceholderText(/Your email address/i);
        await userEvent.type(emailInput, 'test@example.com');
        fireEvent.submit(emailInput.closest('form')!);
        // Success message appears
        expect(await screen.findByText(/You're on the list!/i)).toBeInTheDocument();
    });

    it('does NOT show success state when email is empty and form is submitted', () => {
        render(<NewsletterSection />);
        fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }).closest('form')!);
        // Form not submitted — still showing the input
        expect(screen.getByPlaceholderText(/Your email address/i)).toBeInTheDocument();
        expect(screen.queryByText(/You're on the list!/i)).not.toBeInTheDocument();
    });

    it('hides the form after successful subscription', async () => {
        render(<NewsletterSection />);
        const emailInput = screen.getByPlaceholderText(/Your email address/i);
        await userEvent.type(emailInput, 'hello@ethnica.com');
        fireEvent.submit(emailInput.closest('form')!);
        await screen.findByText(/You're on the list!/i);
        expect(screen.queryByPlaceholderText(/Your email address/i)).not.toBeInTheDocument();
    });
});
