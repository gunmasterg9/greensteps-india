import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Login from './Login';

// Mock the AuthContext hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('Login Component', () => {
  const mockLoginWithEmail = vi.fn();
  const mockLoginWithGoogle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      loginWithEmail: mockLoginWithEmail,
      loginWithGoogle: mockLoginWithGoogle,
      isMock: true
    });
  });

  test('renders login form and mock buttons when isMock is active', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('GreenSteps India')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('citizen@greensteps.in')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Developer Mock Mode Active')).toBeInTheDocument();
    expect(screen.getByText('Standard Citizen')).toBeInTheDocument();
    expect(screen.getByText('App Admin')).toBeInTheDocument();
  });

  test('shows validation error when fields are empty on submit', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
    expect(mockLoginWithEmail).not.toHaveBeenCalled();
  });

  test('calls loginWithEmail with values when submitted', async () => {
    mockLoginWithEmail.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('citizen@greensteps.in');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'citizen@greensteps.in' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLoginWithEmail).toHaveBeenCalledWith('citizen@greensteps.in', 'password123');
    });
  });

  test('displays error message if login fails', async () => {
    mockLoginWithEmail.mockResolvedValue({ success: false, error: 'Invalid user credentials' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('citizen@greensteps.in');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'citizen@greensteps.in' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid user credentials')).toBeInTheDocument();
    });
  });
});
