# Сборник хадисов: как собрать

## Вариант 1. Веб-версия (PWA), 5 минут
1. Положите `index.html`, `sw.js`, `manifest.webmanifest`, `icon.svg` в репозиторий GitHub.
2. Settings → Pages → Deploy from branch → main / root.
3. Откройте адрес вида `https://<имя>.github.io/<репозиторий>/` на телефоне.
4. Chrome: меню → «Установить приложение». Safari (iOS): «Поделиться» → «На экран Домой».

Ограничение: веб-уведомления приходят, только пока приложение или вкладка живы.

## Вариант 2. Мобильное приложение (Android / iOS)
Нужно: Node.js 20+, для Android — Android Studio, для iOS — Mac с Xcode.

```bash
npm install
npx cap add android      # и/или: npx cap add ios
npm run android          # соберёт www/, синхронизирует, откроет Android Studio
```

В Android Studio: Build → Build APK(s) (для теста) или Generate Signed Bundle (для Google Play).

### Android: точные уведомления
Добавьте в `android/app/src/main/AndroidManifest.xml` внутри `<manifest>`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
```
На Android 12+ пользователю может понадобиться разрешить «Будильники и напоминания» в настройках приложения.

### iOS
Откройте проект командой `npm run ios`, выберите команду разработчика (Signing & Capabilities) и запустите на устройстве.
iOS хранит не более 64 запланированных уведомлений, приложение планирует 60 вперёд и пересчитывает их при каждом запуске и изменении настроек.

## Источник хадисов
Адрес JSON с хадисами укажите в `CONFIG.API_URL` (`index.html`) или в Настройках приложения.
Поля: `text`, `narrator`, `source`, `number`, `grade`, `category`, `url`, `ar` (по желанию).
Показываются только `grade` = сахих / хасан.

## Свой идентификатор
Замените `com.example.hadith` в `capacitor.config.json` на свой (например, `ru.yourname.hadith`) до `npx cap add`.
