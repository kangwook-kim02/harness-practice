import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home', () => {
  it('renders the platform heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '대학생 단기 숙박 공유 플랫폼'
    )
  })
})
