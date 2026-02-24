import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input component', () => {
    it('renders without crashing', () => {
        render(<Input />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
        render(<Input placeholder="Enter email" />);
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('accepts typed input', async () => {
        render(<Input />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        await userEvent.type(input, 'hello@example.com');
        expect(input.value).toBe('hello@example.com');
    });

    it('calls onChange handler', async () => {
        const handleChange = jest.fn();
        render(<Input onChange={handleChange} />);
        await userEvent.type(screen.getByRole('textbox'), 'a');
        expect(handleChange).toHaveBeenCalled();
    });

    it('is disabled when disabled prop is passed', () => {
        render(<Input disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('forwards type attribute', () => {
        render(<Input type="password" data-testid="pw" />);
        const input = document.querySelector('[data-testid="pw"]') as HTMLInputElement;
        expect(input.type).toBe('password');
    });

    it('merges custom className', () => {
        render(<Input className="custom-border" />);
        expect(screen.getByRole('textbox').className).toContain('custom-border');
    });
});
