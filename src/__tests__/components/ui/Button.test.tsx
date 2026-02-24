import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button component', () => {
    it('renders children correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('applies default (primary) variant class', () => {
        render(<Button>Primary</Button>);
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('bg-gradient-to-r');
    });

    it('applies outline variant class', () => {
        render(<Button variant="outline">Outline</Button>);
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('border-2');
    });

    it('applies destructive variant class', () => {
        render(<Button variant="destructive">Delete</Button>);
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('bg-red-500');
    });

    it('applies ghost variant class', () => {
        render(<Button variant="ghost">Ghost</Button>);
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('hover:bg-neutral-100');
    });

    it('applies size sm class', () => {
        render(<Button size="sm">Small</Button>);
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('h-9');
    });

    it('applies size lg class', () => {
        render(<Button size="lg">Large</Button>);
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('h-13');
    });

    it('merges custom className', () => {
        render(<Button className="my-custom-class">Custom</Button>);
        const btn = screen.getByRole('button');
        expect(btn.className).toContain('my-custom-class');
    });

    it('is disabled when disabled prop is passed', () => {
        render(<Button disabled>Disabled</Button>);
        const btn = screen.getByRole('button');
        expect(btn).toBeDisabled();
    });

    it('calls onClick handler when clicked', async () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Clickable</Button>);
        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does NOT fire onClick when disabled', async () => {
        const handleClick = jest.fn();
        render(<Button disabled onClick={handleClick}>Disabled</Button>);
        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('passes through HTML button attributes', () => {
        render(<Button type="submit" aria-label="submit form">Submit</Button>);
        const btn = screen.getByRole('button');
        expect(btn).toHaveAttribute('type', 'submit');
        expect(btn).toHaveAttribute('aria-label', 'submit form');
    });
});
