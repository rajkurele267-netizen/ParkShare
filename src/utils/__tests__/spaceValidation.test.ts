import { describe, it, expect } from 'vitest'
import { validateSpace, validateImage } from '../spaceValidation'

const good = { title: 'My bay', description: '', rules: '', address: '12 Main Road', area: 'HSR', city: 'Bengaluru', price: '40', vehicle: 'car' as const, from: '06:00', to: '22:00', isAvailable: true }

describe('validateSpace', () => {
  it('accepts a valid listing', () => expect(validateSpace(good)).toEqual({}))
  it('rejects a short title', () => expect(validateSpace({ ...good, title: 'ab' }).title).toBeTruthy())
  it('rejects price 0, empty and too high', () => {
    expect(validateSpace({ ...good, price: '0' }).price).toBeTruthy()
    expect(validateSpace({ ...good, price: '' }).price).toBeTruthy()
    expect(validateSpace({ ...good, price: '10001' }).price).toBeTruthy()
  })
  it('allows 2 decimals but not 3', () => {
    expect(validateSpace({ ...good, price: '12.5' }).price).toBeUndefined()
    expect(validateSpace({ ...good, price: '12.555' }).price).toBeTruthy()
  })
  it('requires closing after opening', () => expect(validateSpace({ ...good, from: '10:00', to: '10:00' }).to).toBeTruthy())
})

describe('validateImage', () => {
  it('rejects gifs', () => expect(validateImage({ type: 'image/gif', size: 10 })).not.toBeNull())
  it('rejects files over 5 MB', () => expect(validateImage({ type: 'image/png', size: 6 * 1024 * 1024 })).not.toBeNull())
  it('accepts a small webp', () => expect(validateImage({ type: 'image/webp', size: 1000 })).toBeNull())
})
