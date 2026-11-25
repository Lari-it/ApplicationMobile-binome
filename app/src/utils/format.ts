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

/** "500 g" avec ratio 2 -> "1000 g" ; "1/2 kg" avec ratio 2 -> "1 kg" ; "un peu" reste "un peu" */
export function ajusterQuantite(quantite: string, ratio: number): string {
  const m = quantite.trim().match(/^(\d+(?:[.,]\d+)?)(?:\/(\d+))?(.*)$/);
  if (!m || ratio === 1) return quantite;
  let valeur = parseFloat(m[1].replace(',', '.'));
  if (m[2]) valeur = valeur / parseInt(m[2], 10);
  const resultat = Math.round(valeur * ratio * 100) / 100;
  return `${resultat.toLocaleString('fr-FR')}${m[3]}`;
}
