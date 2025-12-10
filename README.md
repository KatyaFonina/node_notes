API для работы с заметками на Node.js + Express + MongoDB

Установка
Установите зависимости:
npm install
Установите и запустите MongoDB:

Локальная установка MongoDB

Скачайте и установите MongoDB Community Server
Запустите MongoDB сервис
Проверьте: mongosh или mongo

Создайте файл .env в корне проекта:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/notesdb

Запуск

Запуск сервера:
npm start

Запуск тестов:
npm test