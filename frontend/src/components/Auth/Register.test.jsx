import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Register from './Register';

// Mock the AuthContext hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('Register Component', () => {
  const mockRegisterWithEmail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      registerWithEmail: mockRegisterWithEmail,
      isMock: true
    });
  });

  test('renders registration form fields correctly', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText('Join GreenSteps')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rahul Kumar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('rahul@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min 6 characters')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'State / UT' })).toBeInTheDocument(); // State drop down
  });

  test('shows validation error when fields are empty on submit', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const registerBtn = screen.getByRole('button', { name: /Register/i });
    fireEvent.click(registerBtn);

    expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
    expect(mockRegisterWithEmail).not.toHaveBeenCalled();
  });

  test('populates city options after selecting a state', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const stateSelect = screen.getByRole('combobox', { name: 'State / UT' }); // We will query state select
    // Since there are multiple select elements, let's query them specifically by their first option
    const selects = screen.getAllByRole('combobox');
    const stateSelector = selects[0];
    const citySelector = selects[1];

    expect(citySelector).toBeDisabled();

    // Select Delhi state
    fireEvent.change(stateSelector, { target: { value: 'Delhi' } });

    expect(stateSelector.value).toBe('Delhi');
    expect(citySelector).not.toBeDisabled();
    expect(screen.getByText('New Delhi')).toBeInTheDocument();
  });

  test('calls registerWithEmail with values when submitted successfully', async () => {
    mockRegisterWithEmail.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText('Rahul Kumar');
    const emailInput = screen.getByPlaceholderText('rahul@example.com');
    const passwordInput = screen.getByPlaceholderText('Min 6 characters');
    
    const selects = screen.getAllByRole('combobox');
    const stateSelector = selects[0];
    const citySelector = selects[1];

    fireEvent.change(nameInput, { target: { value: 'Rahul Kumar' } });
    fireEvent.change(emailInput, { target: { value: 'rahul@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(stateSelector, { target: { value: 'Delhi' } });
    fireEvent.change(citySelector, { target: { value: 'New Delhi' } });

    const registerBtn = screen.getByRole('button', { name: /Register/i });
    fireEvent.click(registerBtn);

    await waitFor(() => {
      expect(mockRegisterWithEmail).toHaveBeenCalledWith(
        'Rahul Kumar',
        'rahul@example.com',
        'password123',
        'Delhi',
        'New Delhi'
      );
    });
  });
});
