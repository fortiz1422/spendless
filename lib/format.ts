export function formatAmount(amount: number, currency: 'ARS' | 'USD'): string {
  if (currency === 'ARS') {
    return '$ ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(amount)
  }
  return 'USD ' + new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
