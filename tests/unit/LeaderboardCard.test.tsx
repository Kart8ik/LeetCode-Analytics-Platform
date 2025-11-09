import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import Leaderboard from "../../src/pages/Leaderboard.tsx";

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    role: 'user'
  })
}));

// Mock leaderboard data
const mockLeaderboardData = [
  {
    user_id: "1",
    username: "user1",
    real_name: "User One",
    section: "A",
    semester: "5",
    easy_solved: 10,
    medium_solved: 5,
    hard_solved: 2,
    total_solved: 17,
    streak_count: 5,
    global_rank: 1
  }
];

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn((functionName) => {
      if (functionName === 'get_leaderboard_json') {
        return Promise.resolve({
          data: mockLeaderboardData,
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    })
  }
}));

// Mock react-router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/leaderboard',
      search: '',
      hash: '',
      state: null
    })
  };
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("Leaderboard Page", () => {

  it("renders leaderboard content correctly", async () => {
    // Render the page inside act()
    await act(async () => {
      render(
        <BrowserRouter>
          <Leaderboard />
        </BrowserRouter>
      );
    });

    // Wait for the async data fetch to resolve and check for the header
    await waitFor(() => {
      expect(screen.getByText(/LeetTrack/i)).toBeInTheDocument();
    });

    // Wait for and verify user data
    await waitFor(() => {
      // Find user name in the table cell
      const userCell = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'div' && 
               element?.className.includes('font-medium') && 
               content === 'User One';
      });
      expect(userCell).toBeInTheDocument();

      // Find total solved - in a cell with font-semibold class
      const totalSolvedCell = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'td' &&
               element?.className.includes('font-semibold') &&
               content === '17';
      });
      expect(totalSolvedCell).toBeInTheDocument();

      // For streak count, find the td with streak count 5
      const streakCell = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'td' &&
               !element?.className.includes('py-3') &&
               content === '5';
      });
      expect(streakCell).toBeInTheDocument();

      // Verify toast was shown
      expect(toast.success).toHaveBeenCalledWith('Leaderboard fetched successfully');
    });
  });

  it('handles empty leaderboard gracefully', async () => {
    ;(supabase.rpc as any).mockResolvedValueOnce({ data: [], error: null })

    await act(async () => {
      render(
        <BrowserRouter>
          <Leaderboard />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Leaderboard fetched successfully');
    });
  });

  it('shows error toast when rpc returns error', async () => {
    ;(supabase.rpc as any).mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

    await act(async () => {
      render(
        <BrowserRouter>
          <Leaderboard />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('fail');
    });
  });
});
