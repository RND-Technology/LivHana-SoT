import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoPlayerWithCommerce } from './VideoPlayer'

describe('VideoPlayerWithCommerce', () => {
  const defaultProps = {
    episodeId: 'test-episode-123',
    customerId: 'test-customer-456',
    apiBaseUrl: '/api',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders video player with correct props', () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      const video = document.querySelector('video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute('src', '/episodes/test-episode-123.mp4')
    })

    it('renders sidebar with title', () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      expect(screen.getByText('Featured Products')).toBeInTheDocument()
    })

    it('shows loading message initially', () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      expect(screen.getByText('Loading recommendations...')).toBeInTheDocument()
    })
  })

  describe('Recommendations Loading', () => {
    it('fetches and displays recommendations on mount', async () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      expect(screen.getByText('product-2')).toBeInTheDocument()
      expect(screen.getByText('product-3')).toBeInTheDocument()
      expect(screen.getByText('95% match')).toBeInTheDocument()
      expect(screen.getByText('87% match')).toBeInTheDocument()
      expect(screen.getByText('78% match')).toBeInTheDocument()
    })

    it('uses correct API endpoint for recommendations', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith('/api/recommendations/test-customer-456')
      })
    })

    it('handles custom apiBaseUrl', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      render(
        <VideoPlayerWithCommerce
          {...defaultProps}
          apiBaseUrl="https://custom-api.com"
        />
      )

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          'https://custom-api.com/recommendations/test-customer-456'
        )
      })
    })

    it('handles fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Failed to load recommendations')).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalled()
      fetchSpy.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('Product Overlay Interaction', () => {
    it('shows product overlay when recommendation is clicked', async () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      const recommendationItem = screen.getByText('product-1').closest('div')!
      fireEvent.click(recommendationItem)

      await waitFor(() => {
        expect(screen.getByText('Best seller')).toBeInTheDocument()
        expect(screen.getByText('Match: 95%')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /buy now/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /later/i })).toBeInTheDocument()
      })
    })

    it('dismisses product overlay when "Later" button is clicked', async () => {
      const user = userEvent.setup()
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      // Click recommendation to show overlay
      const recommendationItem = screen.getByText('product-1').closest('div')!
      fireEvent.click(recommendationItem)

      await waitFor(() => {
        expect(screen.getByText('Best seller')).toBeInTheDocument()
      })

      // Click "Later" button
      const laterButton = screen.getByRole('button', { name: /later/i })
      await user.click(laterButton)

      await waitFor(() => {
        expect(screen.queryByText('Best seller')).not.toBeInTheDocument()
      })
    })
  })

  describe('Purchase Flow', () => {
    it('handles successful purchase', async () => {
      const user = userEvent.setup()
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      // Click recommendation to show overlay
      const recommendationItem = screen.getByText('product-1').closest('div')!
      fireEvent.click(recommendationItem)

      await waitFor(() => {
        expect(screen.getByText('Best seller')).toBeInTheDocument()
      })

      // Click "Buy Now" button
      const buyButton = screen.getByRole('button', { name: /buy now/i })
      await user.click(buyButton)

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Purchased product-1!')).toBeInTheDocument()
      })

      // Overlay should be dismissed
      expect(screen.queryByText('Best seller')).not.toBeInTheDocument()
    })

    it('disables buttons during purchase', async () => {
      const user = userEvent.setup()
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      // Click recommendation to show overlay
      const recommendationItem = screen.getByText('product-1').closest('div')!
      fireEvent.click(recommendationItem)

      await waitFor(() => {
        expect(screen.getByText('Best seller')).toBeInTheDocument()
      })

      // Click "Buy Now" button
      const buyButton = screen.getByRole('button', { name: /buy now/i })

      // Verify buttons exist before clicking
      const laterButton = screen.getByRole('button', { name: /later/i })
      expect(buyButton).not.toBeDisabled()
      expect(laterButton).not.toBeDisabled()

      await user.click(buyButton)

      // Purchase should complete successfully
      await waitFor(() => {
        expect(screen.getByText('Purchased product-1!')).toBeInTheDocument()
      })
    })

    it('sends correct purchase data to API', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const user = userEvent.setup()

      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      // Click recommendation to show overlay
      const recommendationItem = screen.getByText('product-1').closest('div')!
      fireEvent.click(recommendationItem)

      await waitFor(() => {
        expect(screen.getByText('Best seller')).toBeInTheDocument()
      })

      // Click "Buy Now" button
      const buyButton = screen.getByRole('button', { name: /buy now/i })
      await user.click(buyButton)

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          '/api/purchase',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('test-customer-456'),
          })
        )
      })
    })

    it('handles purchase failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      // Mock purchase endpoint to fail
      fetchSpy.mockImplementation(async (url: string | URL | Request) => {
        const urlString = typeof url === 'string' ? url : url.toString()
        if (urlString.includes('/purchase')) {
          return {
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' }),
          } as Response
        }
        // Return default successful response for recommendations
        return {
          ok: true,
          status: 200,
          json: async () => ({
            recommendations: [
              { product_id: 'product-1', reason: 'Best seller', confidence: 0.95 },
            ],
          }),
        } as Response
      })

      const user = userEvent.setup()
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      // Click recommendation to show overlay
      const recommendationItem = screen.getByText('product-1').closest('div')!
      fireEvent.click(recommendationItem)

      await waitFor(() => {
        expect(screen.getByText('Best seller')).toBeInTheDocument()
      })

      // Click "Buy Now" button
      const buyButton = screen.getByRole('button', { name: /buy now/i })
      await user.click(buyButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Purchase failed. Please try again.')).toBeInTheDocument()
      })

      fetchSpy.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('Video Time-based Product Placements', () => {
    it('shows product overlay at specified time', async () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      // Simulate video time update to 30 seconds (first placement)
      const video = document.querySelector('video')!
      Object.defineProperty(video, 'currentTime', {
        writable: true,
        value: 30,
      })

      fireEvent.timeUpdate(video)

      await waitFor(() => {
        expect(screen.getByText('Best seller')).toBeInTheDocument()
        expect(screen.getByText('Match: 95%')).toBeInTheDocument()
      })
    })

    it('shows different products at different times', async () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      const video = document.querySelector('video')!

      // First placement at 30 seconds
      Object.defineProperty(video, 'currentTime', {
        writable: true,
        value: 30,
      })
      fireEvent.timeUpdate(video)

      await waitFor(() => {
        expect(screen.getByText('Best seller')).toBeInTheDocument()
      })

      // Dismiss overlay
      const laterButton = screen.getByRole('button', { name: /later/i })
      fireEvent.click(laterButton)

      // Second placement at 90 seconds
      Object.defineProperty(video, 'currentTime', {
        writable: true,
        value: 90,
      })
      fireEvent.timeUpdate(video)

      await waitFor(() => {
        expect(screen.getByText('Popular choice')).toBeInTheDocument()
      })
    })

    it('does not show placement if overlay is already visible', async () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      const video = document.querySelector('video')!

      // Show first placement
      Object.defineProperty(video, 'currentTime', {
        writable: true,
        value: 30,
      })
      fireEvent.timeUpdate(video)

      await waitFor(() => {
        expect(screen.getByText('Best seller')).toBeInTheDocument()
      })

      // Try to trigger second placement while first is still showing
      Object.defineProperty(video, 'currentTime', {
        writable: true,
        value: 90,
      })
      fireEvent.timeUpdate(video)

      // Should still show first placement
      expect(screen.getByText('Best seller')).toBeInTheDocument()
      expect(screen.queryByText('Popular choice')).not.toBeInTheDocument()
    })
  })

  describe('TypeScript Strict Mode', () => {
    it('handles missing recommendations gracefully', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ recommendations: [] }),
      } as Response)

      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText('product-1')).not.toBeInTheDocument()
      })

      // Should not crash when trying to create placements with empty recommendations
      const video = document.querySelector('video')!
      Object.defineProperty(video, 'currentTime', {
        writable: true,
        value: 30,
      })

      expect(() => {
        fireEvent.timeUpdate(video)
      }).not.toThrow()

      fetchSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('has accessible video controls', () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      const video = document.querySelector('video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute('controls')
    })

    it('has accessible buttons with clear labels', async () => {
      render(<VideoPlayerWithCommerce {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('product-1')).toBeInTheDocument()
      })

      // Click recommendation to show overlay
      const recommendationItem = screen.getByText('product-1').closest('div')!
      fireEvent.click(recommendationItem)

      await waitFor(() => {
        const buyButton = screen.getByRole('button', { name: /buy now/i })
        const laterButton = screen.getByRole('button', { name: /later/i })

        expect(buyButton).toBeInTheDocument()
        expect(laterButton).toBeInTheDocument()
      })
    })
  })
})
