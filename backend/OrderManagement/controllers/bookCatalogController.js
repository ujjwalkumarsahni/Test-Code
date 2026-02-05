import asyncHandler from "express-async-handler";
import BookCatalog from "../models/BookCatalog.js";

// @desc    Get all books catalog
// @route   GET /api/books/catalog
// @access  Private
export const getBookCatalog = asyncHandler(async (req, res) => {
  const { bookType, grade, status } = req.query;

  let query = {};

  if (bookType) query.bookType = bookType;
  if (grade) query.grade = grade;
  if (status) query.status = status;

  const books = await BookCatalog.find(query).sort({ bookType: 1, grade: 1, name: 1 });

  // Group by bookType and grade for easier consumption
  const groupedCatalog = books.reduce((acc, book) => {
    if (!acc[book.bookType]) {
      acc[book.bookType] = {};
    }
    
    if (book.grade) {
      if (!acc[book.bookType][book.grade]) {
        acc[book.bookType][book.grade] = [];
      }
      acc[book.bookType][book.grade].push(book);
    } else {
      if (!acc[book.bookType].general) {
        acc[book.bookType].general = [];
      }
      acc[book.bookType].general.push(book);
    }
    
    return acc;
  }, {});

  res.json({
    success: true,
    count: books.length,
    data: groupedCatalog,
    flatData: books
  });
});

// @desc    Get book catalog structure
// @route   GET /api/books/structure
// @access  Private
export const getBookStructure = asyncHandler(async (req, res) => {
  const bookStructure = {
    ELP: {
      'Pre-Nursery': [
        'Math O Mania Part-1',
        'Math O Mania Part-2',
        'Alpha O Mania Part-1',
        'Alpha O Mania Part-2',
        'Pyare Axar Part-1',
        'Pyare Axar Part-2',
        'Pyare Axar Part-3',
        'Rhyme Book',
        'Steamheartia'
      ],
      'LKG': [
        'Axar Masti Part-1',
        'Axar Masti Part-2',
        'Letter Land Heroes',
        'Number Nuts Part-1',
        'Number Nuts Part-2',
        'Rhyme Book',
        'SoundTopia',
        'Thinky Tots Lab'
      ],
      'UKG': [
        'Kahani Kadam Part-1',
        'Kahani Kadam Part-2',
        'Number Bots Part-1',
        'Number Bots Part-2',
        'PenPals Paradise Part-1',
        'SoundSpark Part-1',
        'Rhyme Bunny',
        'Tiny Tinker Lab'
      ]
    },
    LTE: {
      'Grade 1': ['LTE Grade 1'],
      'Grade 2': ['LTE Grade 2'],
      'Grade 3': ['LTE Grade 3'],
      'Grade 4': ['LTE Grade 4'],
      'Grade 5': ['LTE Grade 5']
    },
    CAC: {
      'Grade 1': ['CAC Grade 1'],
      'Grade 2': ['CAC Grade 2'],
      'Grade 3': ['CAC Grade 3'],
      'Grade 4': ['CAC Grade 4'],
      'Grade 5': ['CAC Grade 5'],
      'Grade 6': ['CAC Grade 6'],
      'Grade 7': ['CAC Grade 7'],
      'Grade 8': ['CAC Grade 8']
    },
    CTF: {
      'Grade 6': ['CTF Grade 6'],
      'Grade 7': ['CTF Grade 7'],
      'Grade 8': ['CTF Grade 8'],
      'Grade 9-12': ['CTF Grade 9-12']
    },
    KITS: {
      'Combo Kits': ['Wonder Kit', 'Nexus Kit'],
      'Individual Kits': ['Individual Kit']
    }
  };

  res.json({
    success: true,
    data: bookStructure
  });
});

// @desc    Create book catalog entry
// @route   POST /api/books/catalog
// @access  Private/Admin
export const createBookCatalog = asyncHandler(async (req, res) => {
  const {
    bookType,
    grade,
    name,
    code,
    description,
    defaultPrice,
    isCombo,
    comboIncludes
  } = req.body;

  // Check if book with same code exists
  const bookExists = await BookCatalog.findOne({ code });
  if (bookExists) {
    res.status(400);
    throw new Error("Book with this code already exists");
  }

  const book = await BookCatalog.create({
    bookType,
    grade,
    name,
    code,
    description,
    defaultPrice,
    isCombo,
    comboIncludes,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: book
  });
});

// @desc    Update book catalog entry
// @route   PUT /api/books/catalog/:id
// @access  Private/Admin
export const updateBookCatalog = asyncHandler(async (req, res) => {
  const book = await BookCatalog.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const updatedBook = await BookCatalog.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user._id
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedBook
  });
});

// @desc    Delete book catalog entry
// @route   DELETE /api/books/catalog/:id
// @access  Private/Admin
export const deleteBookCatalog = asyncHandler(async (req, res) => {
  const book = await BookCatalog.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  await book.deleteOne();

  res.json({
    success: true,
    message: "Book removed from catalog"
  });
});