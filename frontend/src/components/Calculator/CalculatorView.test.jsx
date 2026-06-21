import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../../context/AuthContext';
import CalculatorView from './CalculatorView';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('CalculatorView Component', () => {
  const mockUpdateUserProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { state: 'Delhi' },
      updateUserProfile: mockUpdateUserProfile
    });
  });

  test('renders step 1 (Transport) on load', () => {
    render(<CalculatorView />);

    expect(screen.getByText(/Carbon Calculator • Step 1 of 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Transport Habits/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Travel Distance:/i)).toBeInTheDocument();
  });

  test('transitions to next step when clicking Next', () => {
    render(<CalculatorView />);

    // Click Next button
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Carbon Calculator • Step 2 of 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Electricity Consumption/i)).toBeInTheDocument();
  });

  test('advances through all steps to results and allows saving', async () => {
    mockUpdateUserProfile.mockResolvedValue({ success: true });

    render(<CalculatorView />);

    const nextBtn = screen.getByRole('button', { name: /Next/i });

    // Step 1 -> 2
    fireEvent.click(nextBtn);
    // Step 2 -> 3
    fireEvent.click(nextBtn);
    // Step 3 -> 4
    fireEvent.click(nextBtn);
    // Step 4 -> 5
    fireEvent.click(nextBtn);
    // Step 5 -> 6
    fireEvent.click(nextBtn);
    // Step 6 -> 7 (Results)
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Carbon Calculator • Step 7 of 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Carbon Footprint Results/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /Save to Profile/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalled();
    });
  });
});
