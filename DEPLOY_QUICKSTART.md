# 🚀 Quick Deploy Guide

## GitHub Pages (5 минут)

### 1. Создайте репозиторий на GitHub
```bash
# Если еще не создан git репозиторий
git init
git add .
git commit -m "feat: initial commit with auto-deploy"
git branch -M main
```

### 2. Подключите к GitHub
```bash
# Замените YOUR_USERNAME и YOUR_REPO на свои
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3. Настройте GitHub Pages
1. Откройте ваш репозиторий на GitHub
2. **Settings** → **Pages**
3. В **Source** выберите **GitHub Actions**
4. Готово! 🎉

### 4. (Опционально) Настройте base path
Если ваш сайт будет по адресу `username.github.io/repo-name/`:

Отредактируйте `.github/workflows/deploy.yml`, добавьте в секцию Build:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_BASE_PATH: /YOUR_REPO_NAME/  # Замените на имя вашего репо
```

### 5. Деплой
Workflow запустится автоматически при каждом push в `main`.

Или запустите вручную:
- **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### 6. Откройте игру
После завершения деплоя (1-2 минуты), игра будет доступна по адресу:
- `https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## Другие платформы

### Netlify (3 минуты)
1. Зарегистрируйтесь на [netlify.com](https://netlify.com)
2. **New site from Git** → выберите ваш репозиторий
3. Build command: `npm run build`
4. Publish directory: `dist`
5. **Deploy** 🚀

### Vercel (2 минуты)
1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. **Import Project** → выберите репозиторий
3. Framework Preset: **Vite**
4. **Deploy** 🚀

### Cloudflare Pages (3 минуты)
1. Зарегистрируйтесь на [pages.cloudflare.com](https://pages.cloudflare.com)
2. **Create a project** → выберите репозиторий
3. Build command: `npm run build`
4. Build output: `dist`
5. **Save and Deploy** 🚀

---

## Telegram Mini App

После деплоя на любую платформу:

1. Получите URL вашего сайта
2. Откройте [@BotFather](https://t.me/BotFather) в Telegram
3. Создайте бота: `/newbot`
4. Создайте Mini App: `/newapp`
5. Выберите вашего бота
6. Введите URL вашего деплоя
7. Готово! Откройте Mini App в Telegram 📱

---

## Troubleshooting

### Blank page после деплоя?
Проверьте `VITE_BASE_PATH` в workflow файле.

### 404 на assets?
Добавьте файл `public/.nojekyll` (уже создан).

### Не работает в Telegram?
1. Проверьте HTTPS (обязателен для Mini Apps)
2. Проверьте URL в настройках бота
3. Посмотрите Console в DevTools Telegram Desktop

---

**Полная документация**: См. `DEPLOYMENT.md`

