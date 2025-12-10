
const validateNoteData = (req, res, next) => {
  const { title, content } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Нужно название'
    });
  }
  
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Нужен контент'
    });
  }
  req.body.title = title.trim();
  req.body.content = content.trim();
  
  next();
};

module.exports = { validateNoteData };