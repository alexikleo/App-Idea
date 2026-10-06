// Form state for creating or editing a listing, shared by sign-up and the dashboard.

import { useState } from 'react'
import { formatPhone, normalisePhone } from './format'
import type { StrengthInput } from './strength'
import type { ListingInput, PriceUnit, Province, Provider } from '../types'

export interface ServiceDraft {
  key: string
  categoryId: string
  name: string
  price: string
  unit: PriceUnit
}

export type Section = 'about' | 'services' | 'area'

/** All the form state for a listing, plus validation and conversion. */
export function useListingDraft(initial?: Provider) {
  const [name, setName] = useState(initial?.name ?? '')
  const [businessName, setBusinessName] = useState(initial?.businessName ?? '')
  const [phone, setPhone] = useState(initial ? formatPhone(initial.phone) : '')
  const [whatsappSame, setWhatsappSame] = useState(!initial || initial.whatsapp === initial.phone)
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp && initial.whatsapp !== initial.phone ? formatPhone(initial.whatsapp) : '')
  const [noWhatsapp, setNoWhatsapp] = useState(!!initial && !initial.whatsapp)
  const [years, setYears] = useState(initial?.yearsExperience ? String(initial.yearsExperience) : '')
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '')
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.categoryIds ?? [])
  const [services, setServices] = useState<ServiceDraft[]>(
    initial?.services.map((s) => ({ key: s.id, categoryId: s.categoryId, name: s.name, price: String(s.price), unit: s.unit })) ?? [],
  )
  const [province, setProvince] = useState<Province>(initial?.location.province ?? 'Gauteng')
  const [city, setCity] = useState(initial?.location.city ?? '')
  const [suburbs, setSuburbs] = useState(initial?.location.suburbs.join(', ') ?? '')
  const [available24h, setAvailable24h] = useState(initial?.available24h ?? false)

  const suburbList = suburbs
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const whatsappNumber = noWhatsapp ? undefined : whatsappSame ? normalisePhone(phone) : normalisePhone(whatsapp)

  function validate(section: Section): string {
    if (section === 'about') {
      if (name.trim().length < 2) return 'Please enter your name.'
      if (!normalisePhone(phone)) return 'Please enter a valid SA phone number, e.g. 082 123 4567.'
      if (!noWhatsapp && !whatsappSame && !normalisePhone(whatsapp)) return 'That WhatsApp number isn’t valid.'
      if (bio.trim().length < 20) return 'Tell customers a bit about your work (20+ characters).'
    }
    if (section === 'services') {
      if (!categoryIds.length) return 'Choose at least one service category.'
      if (!services.length) return 'Add at least one service with a price.'
      if (services.some((s) => s.name.trim().length < 2 || s.price === '' || Number(s.price) < 0))
        return 'Every service needs a name and a price.'
    }
    if (section === 'area') {
      if (city.trim().length < 2) return 'Please enter your city or town.'
    }
    return ''
  }

  function toInput(): ListingInput {
    return {
      name: name.trim(),
      businessName: businessName.trim() || undefined,
      bio: bio.trim(),
      phone: normalisePhone(phone)!,
      whatsapp: whatsappNumber ?? undefined,
      categoryIds,
      services: services.map((s) => ({ categoryId: s.categoryId, name: s.name.trim(), price: Math.round(Number(s.price)), unit: s.unit })),
      location: { province, city: city.trim(), suburbs: suburbList },
      yearsExperience: Math.max(0, Math.round(Number(years) || 0)),
      available24h,
      photoUrl: photoUrl || undefined,
    }
  }

  const strengthInput: StrengthInput = {
    businessName,
    bio,
    whatsapp: whatsappNumber ?? undefined,
    yearsExperience: Number(years) || 0,
    suburbs: suburbList,
    services: services.map((x) => ({ name: x.name, unit: x.unit, price: Number(x.price) })),
  }

  return {
    fields: {
      name, setName, businessName, setBusinessName, phone, setPhone, whatsappSame, setWhatsappSame, whatsapp, setWhatsapp,
      noWhatsapp, setNoWhatsapp, years, setYears, bio, setBio, photoUrl, setPhotoUrl, categoryIds, setCategoryIds,
      services, setServices, province, setProvince, city, setCity, suburbs, setSuburbs, available24h, setAvailable24h,
    },
    validate,
    toInput,
    strengthInput,
  }
}

export type ListingDraft = ReturnType<typeof useListingDraft>
