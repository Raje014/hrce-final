import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Platform } from '@ionic/angular';

export const mobileOnlyGuard: CanActivateFn = () => {

  const platform = inject(Platform);
  const router = inject(Router);

  const isMobileApp =
    platform.is('capacitor') || platform.is('cordova');

  if (isMobileApp) {
    return true;
  }

  // Browser users → redirect
  router.navigate(['/home']);
  return false;
};