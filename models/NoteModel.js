
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  created: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  changed: {
    type: Date,
    default: Date.now
  }
});


NoteSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.changed = new Date();
  }
  next();
});

NoteSchema.statics.findByTitle = function(title) {
  return this.findOne({ title });
};


NoteSchema.methods.updateNote = function(updates) {
  Object.keys(updates).forEach(key => {
    if (['title', 'content'].includes(key)) {
      this[key] = updates[key];
    }
  });
  this.changed = new Date();
  return this.save();
};

const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;