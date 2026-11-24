/** 6000 ou "6000.00"  ->  "6 000 Ar" */

export function formatAriary(montant: number): string {
  return `${montant.toLocaleString('fr-FR')} Ar`;
}

/** 15000 -> "15 000 Ar" */
export function formatAr(n: number): string {
  return `${n.toLocaleString('fr-FR')} Ar`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}