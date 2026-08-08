export function getJenjangBadgeClass(jenjang: string): string {
  switch (jenjang) {
    case 'Pra Nikah':
      return 'border-orange-200 bg-orange-50 text-orange-500'
    case 'Remaja':
      return 'border-teal-200 bg-teal-50 text-teal-600'
    case 'Pra Remaja':
      return 'border-blue-200 bg-blue-50 text-blue-600'
    default:
      return 'border-gray-200 bg-gray-50 text-gray-500'
  }
}