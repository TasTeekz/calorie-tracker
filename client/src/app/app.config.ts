import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { authInterceptor } from './interceptors/auth.interceptor';

// Регистрируем русский язык для красивых дат
registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'ru-RU' }, // Чтобы даты были "15 апреля", а не "April 15"
  ],
};
