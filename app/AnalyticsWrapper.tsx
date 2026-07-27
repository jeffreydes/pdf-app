'use client';

import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';

export default function AnalyticsWrapper() {
  // We zetten deze standaard op 'true' tijdens de eerste render. 
  // Dit voorkomt dat je per ongeluk een pageview registreert in de milliseconde 
  // voordat de check is voltooid.
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    // Zodra de pagina is geladen, checken we je browser geheugen
    setIsAdmin(window.localStorage.getItem('isAdmin') === 'true');
  }, []);

  // Als het vlaggetje op true staat, renderen we helemaal niks
  if (isAdmin) return null;

  // Is het een normale klant? Dan laden we de Vercel tracking!
  return <Analytics />;
}