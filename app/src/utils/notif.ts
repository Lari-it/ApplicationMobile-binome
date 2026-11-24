import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function notifierNouvelleRecette(nom: string): Promise<void> {
  // Ne rien faire si on n'est pas sur une plateforme native
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Demander la permission si nécessaire
    const permissionStatus = await LocalNotifications.checkPermissions();
    if (permissionStatus.display !== 'granted') {
      const result = await LocalNotifications.requestPermissions();
      if (result.display !== 'granted') {
        return;
      }
    }

    // Envoyer la notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: 'Nouvelle recette ajoutée',
          body: `Votre recette "${nom}" a été ajoutée avec succès !`,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'default',
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#488AFF',
        },
      ],
    });
  } catch (error) {
    console.error('Erreur notification locale:', error);
    // Ne pas propager l'erreur pour ne pas casser l'UX
  }
}
