
const express = require('express');
const router = express.Router();
const Note = require('../models/NoteModel');
const { validateNoteData } = require('../middleware/validation');


router.get('/notes', async (req, res, next) => {
  try {
    const allNotes = await Note.find().sort({ created: -1 });
    
    if (allNotes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Нет запесей в базе' 
      });
    }
    
    res.status(200).json({
      success: true,
      count: allNotes.length,
      data: allNotes
    });
  } catch (error) {
    next(error);
  }
});


router.get('/notes/:noteId', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId);
    
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Нет записи с таким ID' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false, 
        message: 'Неправильный ID' 
      });
    }
    next(error);
  }
});


router.get('/notes/title/:title', async (req, res, next) => {
  try {
    const note = await Note.findByTitle(req.params.title);
    
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Нет записи с таким названием' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
});


router.post('/notes', validateNoteData, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    
    const existingNote = await Note.findByTitle(title);
    if (existingNote) {
      return res.status(409).json({ 
        success: false, 
        message: 'Запись с таким названием уже существует' 
      });
    }
    
    const newNote = new Note({
      title,
      content,
      created: new Date(),
      changed: new Date()
    });
    
    const savedNote = await newNote.save();
    
    res.status(201).json({
      success: true,
      message: 'Успешно создана запись',
      data: savedNote
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: 'Обнаружение дублирующегося заголовка' 
      });
    }
    next(error);
  }
});


router.delete('/notes/:noteId', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId);
    
    if (!note) {
      return res.status(409).json({ 
        success: false, 
        message: 'Невозможно удалить - запись с таким ID не найдена' 
      });
    }
    
    await Note.findByIdAndDelete(req.params.noteId);
    
    res.status(204).send();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(409).json({ 
        success: false, 
        message: 'Неправильный ID' 
      });
    }
    next(error);
  }
});


router.put('/notes/:noteId', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const noteId = req.params.noteId;
    
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(409).json({ 
        success: false, 
        message: 'Изменение невозможно - запись с таким ID не найдена' 
      });
    }
    
    
    if (title && title !== note.title) {
      const duplicateNote = await Note.findByTitle(title);
      if (duplicateNote) {
        return res.status(409).json({ 
          success: false, 
          message: 'Запись с таким названием уже существует' 
        });
      }
    }
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    
    await note.updateNote(updates);
    
    res.status(204).send();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(409).json({ 
        success: false, 
        message: 'Неправильный ID' 
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: 'Обнаружен дублирующийся заголовок' 
      });
    }
    next(error);
  }
});

module.exports = router;