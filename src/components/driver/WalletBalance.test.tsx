import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WalletBalance from './WalletBalance';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';

// Mocking useShuttle
vi.mock('@/contexts/ShuttleContext', () => ({
  useShuttle: vi.fn(),
}));

// Mocking useQuery to control states
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// Mocking react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('WalletBalance Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useQuery as any).mockReturnValue({
      isLoading: true,
      data: undefined,
      error: null,
      refetch: vi.fn(),
    });
    
    (useShuttle as any).mockReturnValue({
      currentUser: { id: 'd1' },
      wallets: [],
      transactions: [],
    });

    render(<WalletBalance />, { wrapper });
    
    // Check if skeletons are rendered (we use Card with skeletons)
    // Looking for classes or some structure that indicates skeletons
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders balance and transactions correctly when data is available', async () => {
    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === 'wallet-balance') {
        return {
          isLoading: false,
          data: 1500000,
          error: null,
          refetch: vi.fn(),
        };
      }
      if (queryKey[0] === 'wallet-transactions') {
        return {
          isLoading: false,
          data: [
            { id: 't1', type: 'top-up', amount: 500000, date: '2026-04-02' }
          ],
          error: null,
          refetch: vi.fn(),
        };
      }
      return { isLoading: false, data: null, refetch: vi.fn() };
    });

    (useShuttle as any).mockReturnValue({
      currentUser: { id: 'd1' },
      wallets: [{ driverId: 'd1', balance: 1500000 }],
      transactions: [{ id: 't1', driverId: 'd1', amount: 500000, type: 'top-up', date: '2026-04-02' }],
    });

    render(<WalletBalance />, { wrapper });

    // The text in component is "Rp 1.500.000" but formatRupiah might have non-breaking spaces
    const balanceText = screen.getByText(/1\.500\.000/);
    expect(balanceText).toBeInTheDocument();
    
    expect(screen.getByText(/Top Up Saldo/)).toBeInTheDocument();
    
    // Use a more specific query for the transaction amount
    // The transaction amount has a "+" or "-" prefix in the component
    const amountText = screen.getByText(/\+\s+500\.000/);
    expect(amountText).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useQuery as any).mockReturnValue({
      isLoading: false,
      data: undefined,
      error: new Error('Failed to fetch'),
      refetch: vi.fn(),
    });

    (useShuttle as any).mockReturnValue({
      currentUser: { id: 'd1' },
      wallets: [],
      transactions: [],
    });

    render(<WalletBalance />, { wrapper });

    expect(screen.getByText(/Gagal Memuat Saldo/)).toBeInTheDocument();
    expect(screen.getByText(/Coba Lagi/)).toBeInTheDocument();
  });

  it('renders empty state for transactions correctly', () => {
    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === 'wallet-balance') {
        return {
          isLoading: false,
          data: 0,
          error: null,
          refetch: vi.fn(),
        };
      }
      if (queryKey[0] === 'wallet-transactions') {
        return {
          isLoading: false,
          data: [],
          error: null,
          refetch: vi.fn(),
        };
      }
      return { isLoading: false, data: null, refetch: vi.fn() };
    });

    (useShuttle as any).mockReturnValue({
      currentUser: { id: 'd1' },
      wallets: [],
      transactions: [],
    });

    render(<WalletBalance />, { wrapper });

    expect(screen.getByText(/Belum ada aktivitas transaksi/)).toBeInTheDocument();
  });
});
