const request = require('supertest');
const app = require('../app');
const Note = require('../models/NoteModel');

describe('Notes API Endpoints', () => {
  beforeEach(async () => {
    await Note.deleteMany({});
  });

  describe('GET /api/notes', () => {
    test('Успешно извлечены все записи', async () => {
      const note1 = new Note({ title: 'Первая запись:', content: 'Первый контент' });
      const note2 = new Note({ title: 'Вторая запись: ', content: 'Второй контент' });
      await note1.save();
      await note2.save();

      const response = await request(app)
        .get('/api/notes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    test('Должен возращать 404 если запись не существует', async () => {
      const response = await request(app)
        .get('/api/notes')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No notes available');
    });
  });

  describe('GET /api/notes/:id', () => {
    test('Должент выдать запись с указанным ID', async () => {
      const note = new Note({ title: 'Test Note', content: 'Test content' });
      await note.save();

      const response = await request(app)
        .get(`/api/notes/${note._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Note');
    });

    test('Должен возращать 404 если запись не найдена по ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/notes/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('Должен возращать 404 если неправильео указан ID', async () => {
      const response = await request(app)
        .get('/api/notes/invalid-id-format')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/notes', () => {
    test('Должен создавать новую запись', async () => {
      const noteData = {
        title: 'Новая запись',
        content: 'Новый контент'
      };

      const response = await request(app)
        .post('/api/notes')
        .send(noteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(noteData.title);
      expect(response.body.data.content).toBe(noteData.content);
    });

    test('Должен отклонять повторяющиеся заголовки', async () => {
      const note = new Note({ title: 'Уникальный заголовок', content: 'контент' });
      await note.save();

      const response = await request(app)
        .post('/api/notes')
        .send({ title: 'Уникальный заголовок', content: 'Еще один контент' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Уже существует');
    });

    test('необходимо проверить наличие обязательных полей', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: '', content: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/notes/:id', () => {
    test('Должен обновить запись', async () => {
      const note = new Note({ title: 'Оригинал', content: 'Оригинал контент' });
      await note.save();

      await request(app)
        .put(`/api/notes/${note._id}`)
        .send({ title: 'Изменненый', content: 'Изменненый контент' })
        .expect(204);

      const updated = await Note.findById(note._id);
      expect(updated.title).toBe('Изменненый');
      expect(updated.content).toBe('Изменненый контент');
    });

    test('Должен обновлять только предоставленные поля', async () => {
      const note = new Note({ title: 'Title', content: 'Content' });
      await note.save();

      await request(app)
        .put(`/api/notes/${note._id}`)
        .send({ content: 'Only content updated' })
        .expect(204);

      const updated = await Note.findById(note._id);
      expect(updated.title).toBe('Title');
      expect(updated.content).toBe('Only content updated');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    test('Должен удалять заметку по ID', async () => {
      const note = new Note({ title: 'To Delete', content: 'Content' });
      await note.save();

      await request(app)
        .delete(`/api/notes/${note._id}`)
        .expect(204);

      const deleted = await Note.findById(note._id);
      expect(deleted).toBeNull();
    });

    test('Должен возращать 409 если записи не сужествует с таким ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/notes/${fakeId}`)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });
});