import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { announce } from './announce';
import { t } from './i18n';

let soundInstance: Audio.Sound | null = null;

/**
 * Triggers audio, haptic, and VoiceOver announcement when a timer step finishes.
 */
export async function notifyTimerFinished(stepName?: string): Promise<boolean> {
  // 1. Accessibility announcement for screen readers
  const message = stepName
    ? `${t('Etap ukończony!')}: ${stepName}`
    : t('Etap ukończony!');
  announce(message);

  // 2. High-priority tactile feedback
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignore in non-native / test environments
  }

  // 3. Audio chime playback
  try {
    if (soundInstance) {
      await soundInstance.unloadAsync().catch(() => {});
      soundInstance = null;
    }

    // Gentle short acoustic sine tone with exponential decay (880Hz A5 + 1760Hz chime, 0.4s PCM WAV)
    const audioDataUri =
      'data:audio/wav;base64,UklGRqQMAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYAMAACA0denhXtdKyp3zNmrh3xhLyhuxtuwiX1lNCZlv9y0i35pOSRduNy4jX9sPSRWsdy9kH9vQiRPqdrBkoByRyVIodnFloF1TCZCmdbImYJ3USg9kNPMnYN5Vis4iM/OoIR6Wy40gMvRpIV7XzExd8bTqIZ9YzUub8HUrIh9ZzksZ7vVsIp+az4rYLTVtIx/bkIqWa3VuI6AcUcqUqbUvJGAc0srTJ7SwJSBdVAtRpfQw5eBd1UvQY/NxpqCeVkxPYfKyZ6De100OYDGy6KEfGE3NnjBzaWGfWU7NHC8zqmHfmk+Mmm2z62JfmxCMWKwz7GLf29HMFyqz7SNf3JLMVWjzriQgHRPMVCczLuSgXZUM0uVyr6VgXhYNEaOyMGYgnpcN0KHxMOcg3tgOT5/wcWfhHxkPDx4vMejhX1nQDlxt8imh35qQzhrssmqiH5tRzdkrcmtin9wSzZep8mwjIBzTzZYoci0j4B1UzdTmse3kYF3VzhOlMW6lIF5WzpKjcK8l4J6XjxGhr+/moN7Yj5DgLzAnYR8ZkFAebjCoIV9aUQ+crPDo4Z+bEg9bK/Epoh+b0s8ZqnEqol/cU87YaTErYt/dFI8W57DsI6AdlY8VpjCs5CBd1o9UpLAtZKBeV0/Toy9uJWCemFBSoa7upiDfGRDR4C3vJuDfGdGRXm0vZ6FfWpJQ3OwvqGGfm1MQm6rv6SHf3BPQWimv6eJf3JSQGOhv6qLf3RWQV6cvqyNgHZZQVmWva+PgHhcQlWRu7KRgXpgRFKLubSTgntjRU6FtraWgnxmR0t/s7eZg31pSkl6sLmbhH1sTEd0rLqehX5vT0ZvqLqhh39xUkVqpLqkiH9zVUVln7qnin91WUVgmrqpjIB3XEZclbisjoB5X0dYkLeukIF6YkhVirWwkoF7ZUpShbKylIJ8aEtPf7Czl4N9a05Neq21mYR+bVBLdam1nIV+cFNKcKW2n4Z/clZKa6G2oYd/dFhJZ522pIl/dltJY5i1pouAeF5KX5O0qI2AeWFLW46zq4+BemRMWImxrJGBe2dNVYSvrpOCfGpPU4CssJWDfWxRUXupsZiDfm9UT3amspqEfnFWTnGispyGf3NZTW2fsp+Hf3VbTWmbsqGIf3deTWWWsaOKgHhhTmGSsKWMgHpjTl6Nr6eNgXtmUFuJramPgXxpUViEq6uRgn1rU1aAqayUgn1uVVR7pq2Wg35wV1N3o66YhH5yWVJyoK6ahX90W1FunK+dhn92XlFqma6fiH93YFFnla6hiYB5Y1Fjka2ji4B6ZVJgjKyljIF7aFNdiKqmjoF8alRbhKiokIJ9bVZZgKapkoJ9b1hXe6OqlIN+cVpWd6GrloR+c1xVc56rmIV/dV5Ub5qrmoZ/dmBUbJernId/eGNUaJOqnoiAeWVVZY+qoIqAemdVYouoooyBe2pWYIeno42BfGxYXoOlpY+BfW5ZXICjppGCfnBbWnyhp5ODfnJcWXiep5WDf3ReWHSbqJeEf3ZgWHGYqJiFf3djV22VqJqHgHhlV2qSp5yIgHpnWGeOp56JgHtpWGWLpp+LgHxrWWKHpKGMgXxtWmCDo6KOgX1vXF5/oaOQgn5xXV18nqSRgn5zX1x4nKWTg391YVt1maWVhH92Y1pyl6WXhX94ZVpvlKWYhoB5Z1pskKSah4B6aVtpjaSciIB7a1tmiqOdioB8bVxkhqKei4F9b11ig6CgjYF9cV5hgJ6hjoJ+cmBffJyhkIJ+dGFeeZqikoN/dmNedpeik4R/d2Vdc5WilYV/eGddcJKil4Z/eWhdbY+imIeAempda4yhmoiAe2xeaImgm4mAfG5fZoafnIqBfXBgZIOenYyBfXJhY3+cno2CfnNiYnyan4+CfnVjYXmYn5CDf3ZlYHaWoJKDf3hnYHSToJOEf3loX3GRoJWFgHpqX26On5aGgHtsYGyLn5iHgHxuYGqInpmIgHxvYWiFnZqKgX1xYmaCm5uLgX5zY2WAmpyMgX50ZGR9mJ2Ogn52ZmN6lp2Pgn93Z2J3lJ2Rg394aGJ0kp6ShH95amJyj52ThX96bGJwjZ2VhoB7bWJtipyWh4B8b2NsiJyXiIB9cWNqhZuYiYB9cmRogpmZioF+dGVngJiai4F+dWZmfZabjYJ/dmdlepWbjoJ/eGlkeJObj4N/eWpkdZGbkYR/emxkc46bkoR/e21kcYybk4WAfG9kb4qalIaAfHBlbYealYeAfXJla4WZloiAfXNmaoKYl4mBfnRnaYCWmIuBfnZoaH2VmYyCf3dpZ3uTmY2Cf3hqZniRmY6Df3lsZnaPmY+Df3ptZnSNmZGEf3tuZnKLmZKFgHxwZnCJmJOGgHxxZ26HmJSHgH1zZ22El5WIgH50aGuClpaJgX51aWqAlZaKgX52aml9k5eLgX94a2l7kpeMgn95bGh5kJeNgn96bWh3jpeOg397bmh1jJePhH97cGhzipeQhIB8cWhxiJeRhYB9cmhwhpaShoB9dGluhJWTh4B+dWptgpSUiIF+dmpsgJOViYF+d2trfZKVioF/eGxqe5CVi4J/eW1qeY+WjIJ/em5qd42WjYN/e3BpdYuWjoN/fHFpdImVj4SAfHJqcoiVkIWAfXNqcYaUkYaAfXRrb4SUkoaAfnZrboKTkoeAfndsbYCSk4iBf3htbX6QlImBf3lubHyPlIqCf3pva3qOlIuCf3pwa3iMlIyDf3txa3aKlI2DgHxya3WJlI6EgH1za3OHk4+EgH10bHKFk5CFgH51bHGDkpCGgH52bXCBkZGHgH53bW+AkJKIgX94bm5+j5KJgX95b218jpKJgX96cG16jZOKgn97cW14i5OLgn98cmx3ipOMg398c211iJKNg4B9dG10hpKOhIB9dW1zhZGPhYB+dm1yg5GPhoB+d25xgZCQhoB+eG9wgI+Qh4F/eW9vfo6RiIF/enBvfI2RiYF/enFueoyRioJ/e3JueYqRioJ/fHNud4mRi4N/fHRudoeRjIOAfXVudYaRjYSAfXZudISQjYSAfndvc4OQjoWAfnhvcoGPj4aAfnhwcYCOj4eBf3lxcH6Nj4eBf3pxcHyMkIiBf3tyb3uLkImBf3tzb3mKkIqCf3x0b3iIkIqCgH11b3eHkIuDgH12b3aFj4yDgH52cHWEj4yEgH53cHSCjo2FgH54cHOBjo6FgH95cXJ/jY6GgH96cnF+jI6HgX96cnF9i4+HgX97c3F7io+IgX98dHB6iY+Jgn98dXB5iI+Kgn99dXB3ho+Kg4B9dnB2hY6Lg4B+d3F1hI6MhIB+eHF0go2MhIB+eXJ0gY2NhYB/eXJzf4yNhoB/enNyfouNhoF/e3NyfYqNh4F/e3RyfImOiIF/fHVyeoiOiIJ/fXVxeYeOiYKAfXZxeIaNioKAfXdyd4WNioOAfnhydoONi4OAfnhydYKMi4SAfnlzdYGMjIWAf3pzdICLjIWAf3t0c36KjIaBf3t0c32JjIaBf3x1c3yJjYeBf3x1c3uIjYiBf312cnqHjYiCgH13cnmFjImCgH54c3iEjImDgH54c3eDjIqDgH55c3aCi4qEgH96c3WBi4uEgH96dHWAiouFgH97dHR+iouFgH97dXR9iYyGgX98dnR8iIyGgX99dnN7h4yHgX99d3N6hoyIgoB9d3N5hYyIgoB+eHR4hIuJgoB+eXR3g4uJg4B+eXR3gouKg4B/enR2gYqKhIB/e3V2f4mKhIB/e3V1fomKhYB/fHZ1fYiLhYF/fHZ0fIeLhoF/fXd0e4aLhoF/fXd0eoaLh4F/fnh0eoWLiIKAfnl0eYSKiIKAfnl1eIOKiIOAfnp1d4KKiYOAf3p1d4GJiYSAf3t2dn+JiYSAf3x2dn6IioSAf3x2dn2HioWBf3x3dX2HioWBf313dXyGioaBf314dXuFioaBf355dXqEioeCgH55dXmDioeCgH56dXmCiYiCgH96dniBiYiDgH97dneAiYiDgH97dneAiImEgH98d3d/iImEgH98d3Z+h4mFgH99eHZ9homFgX99eHZ8hYmGgX99eXZ7hYmGgYB+eXZ6hImGgYB+enZ6g4mHgoB+enZ5gomHgoB/e3Z4gYiIg4B/e3d4gIiIg4B/fHd4gIeIg4B/fHd3f4eIhIB/fXh3foaIhIB/fXh3fYaJhYF/fXl3fIWJhYF/fnl3e4SIhYF/fnp3e4SIhoGAfnp3eoOIhoKAfnt3eYKIh4KAf3t3eYGIh4KAf3t3eICHh4OAf3x4eA==';
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioDataUri },
      { shouldPlay: true, volume: 1.0 }
    );
    soundInstance = sound;
    return true;
  } catch {
    return false;
  }
}

/**
 * Triggers audio, haptic, and VoiceOver announcement specifically for Dutch oven steam release gate.
 */
export async function notifySteamReleaseAlert(): Promise<boolean> {
  const message = t('Zdejmij pokrywkę garnka! Wypuść parę.');
  announce(message);

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Ignore in non-native / test environments
  }

  return notifyTimerFinished(message);
}

