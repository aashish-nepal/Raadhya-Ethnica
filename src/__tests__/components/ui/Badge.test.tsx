import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge component', () => {
    it('renders children text', () => {
        render(<Badge>New</Badge>);
        expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('applies default variant classes', () => {
        render(<Badge>Default</Badge>);
        const badge = screen.getByText('Default');
        expect(badge.className).toContain('bg-neutral-100');
        expect(badge.className).toContain('text-neutral-800');
    });

    it('applies success variant classes', () => {
        render(<Badge variant="success">In Stock</Badge>);
        const badge = screen.getByText('In Stock');
        expect(badge.className).toContain('bg-green-100');
        expect(badge.className).toContain('text-green-800');
    });

    it('applies danger variant classes', () => {
        render(<Badge variant="danger">Out of Stock</Badge>);
        const badge = screen.getByText('Out of Stock');
        expect(badge.className).toContain('bg-red-100');
    });

    it('applies warning variant classes', () => {
        render(<Badge variant="warning">Low Stock</Badge>);
        const badge = screen.getByText('Low Stock');
        expect(badge.className).toContain('bg-yellow-100');
    });

    it('applies outline variant classes', () => {
        render(<Badge variant="outline">Outline</Badge>);
        const badge = screen.getByText('Outline');
        expect(badge.className).toContain('border');
    });

    it('merges custom className', () => {
        render(<Badge className="uppercase">Custom</Badge>);
        const badge = screen.getByText('Custom');
        expect(badge.className).toContain('uppercase');
    });

    it('renders as a div element', () => {
        render(<Badge>Div Badge</Badge>);
        const badge = screen.getByText('Div Badge');
        expect(badge.tagName).toBe('DIV');
    });
});
