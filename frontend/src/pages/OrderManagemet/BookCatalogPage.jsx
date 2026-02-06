// frontend/src/pages/BookCatalogPage.jsx
import React, { useState, useEffect } from 'react';
import { bookAPI } from '../../api/api.js';
import { formatCurrency } from '../../utils/formatters.js';

const BookCatalogPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({
    bookType: 'ELP',
    grade: '',
    name: '',
    code: '',
    description: '',
    defaultPrice: 0,
    isCombo: false,
    comboIncludes: [],
    status: 'active'
  });

  // Book types and grades
  const bookTypes = [
    { value: 'ELP', label: 'Early Learning Program' },
    { value: 'LTE', label: 'Little Tech Explorers' },
    { value: 'CAC', label: 'Coding & Computer' },
    { value: 'CTF', label: 'Creative Tech for Future' },
    { value: 'KITS', label: 'Kits' }
  ];

  const getGradesForType = (type) => {
    switch(type) {
      case 'ELP': return ['Pre-Nursery', 'LKG', 'UKG'];
      case 'LTE': return ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
      case 'CAC': return ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
      case 'CTF': return ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9-12'];
      case 'KITS': return ['Combo Kits', 'Individual Kits', 'General'];
      default: return [];
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookAPI.getCatalog();
      setBooks(response.flatData || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      alert('Failed to load book catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await bookAPI.createBook(formData);
      alert('Book added successfully');
      setShowAddModal(false);
      resetForm();
      fetchBooks();
    } catch (error) {
      alert('Failed to add book');
    }
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      await bookAPI.updateBook(selectedBook._id, formData);
      alert('Book updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchBooks();
    } catch (error) {
      alert('Failed to update book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book from catalog?')) {
      try {
        await bookAPI.deleteBook(bookId);
        alert('Book deleted successfully');
        fetchBooks();
      } catch (error) {
        alert('Failed to delete book');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bookType: 'ELP',
      grade: '',
      name: '',
      code: '',
      description: '',
      defaultPrice: 0,
      isCombo: false,
      comboIncludes: [],
      status: 'active'
    });
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setFormData({
      bookType: book.bookType,
      grade: book.grade || '',
      name: book.name,
      code: book.code,
      description: book.description || '',
      defaultPrice: book.defaultPrice,
      isCombo: book.isCombo || false,
      comboIncludes: book.comboIncludes || [],
      status: book.status || 'active'
    });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div>
              <h1 className="text-4xl font-bold">Book Catalog</h1>
              <p className="mt-3 text-blue-200 text-lg">
                Manage all books and kits available for ordering
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="bg-blue-800/50 px-4 py-2 rounded-lg">
                  <span className="text-blue-200">Total Books:</span>
                  <span className="ml-2 text-xl font-bold">{books.length}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Book
            </button>
          </div>
        </div>

        {/* Book Catalog Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading book catalog...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No books in catalog</h3>
              <p className="mt-2 text-gray-500">Get started by adding books to the catalog.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add First Book
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{book.code}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{book.name}</div>
                        {book.description && (
                          <div className="text-sm text-gray-500">{book.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          book.bookType === 'ELP' ? 'bg-blue-100 text-blue-800' :
                          book.bookType === 'LTE' ? 'bg-green-100 text-green-800' :
                          book.bookType === 'CAC' ? 'bg-purple-100 text-purple-800' :
                          book.bookType === 'CTF' ? 'bg-pink-100 text-pink-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {book.bookType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{book.grade || 'N/A'}</td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(book.defaultPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          book.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openEditModal(book)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Book"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Book"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Add New Book to Catalog</h3>
              <form onSubmit={handleAddBook}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Book Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Type *
                    </label>
                    <select
                      value={formData.bookType}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          bookType: e.target.value,
                          grade: getGradesForType(e.target.value)[0] || ''
                        }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {bookTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Grade</option>
                      {getGradesForType(formData.bookType).map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  {/* Book Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Book Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="e.g., ELP-PN-001"
                    />
                  </div>

                  {/* Default Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Price *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.defaultPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, defaultPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Is Combo */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isCombo"
                      checked={formData.isCombo}
                      onChange={(e) => setFormData(prev => ({ ...prev, isCombo: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isCombo" className="ml-2 text-sm text-gray-700">
                      This is a combo pack
                    </label>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Book</h3>
              <form onSubmit={handleEditBook}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Similar form fields as Add Modal, pre-filled with selectedBook data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Type *
                    </label>
                    <select
                      value={formData.bookType}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {bookTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Price *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.defaultPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, defaultPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Update Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCatalogPage;