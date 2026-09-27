import { describe, it, expect } from 'vitest'
import { imageUrl, imageSrcSet } from './image'

const IK = 'https://ik.imagekit.io/uh97licy8/conjuntos%20historicos%20/Teror_dgljuk.jpeg'
const CL = 'https://res.cloudinary.com/dvsldhnaa/image/upload/v1786897370/Teror_dgljuk.jpg'

describe('imageUrl', () => {
  it('ImageKit: añade tr con tamaño del preset y foco automático', () => {
    expect(imageUrl(IK, 'card')).toBe(`${IK}?tr=w-800,h-600,fo-auto`)
  })

  it('ImageKit: respeta query params existentes', () => {
    expect(imageUrl(`${IK}?updatedAt=1`, 'thumb')).toBe(`${IK}?updatedAt=1&tr=w-320,h-240,fo-auto`)
  })

  it('Cloudinary: mantiene f_auto,q_auto con el ancho del preset', () => {
    expect(imageUrl(CL, 'hero')).toBe(
      'https://res.cloudinary.com/dvsldhnaa/image/upload/f_auto,q_auto,w_1600/v1786897370/Teror_dgljuk.jpg',
    )
  })

  it('otras URLs se devuelven sin cambios', () => {
    expect(imageUrl('https://example.com/a.jpg', 'card')).toBe('https://example.com/a.jpg')
  })
})

describe('imageSrcSet', () => {
  it('genera una entrada por ancho, sin recorte', () => {
    expect(imageSrcSet(IK, [640, 1600])).toBe(`${IK}?tr=w-640 640w, ${IK}?tr=w-1600 1600w`)
  })
})
