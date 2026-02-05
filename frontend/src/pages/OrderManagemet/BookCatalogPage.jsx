// frontend/src/pages/BookCatalogPage.jsx
import React, { useState, useEffect } from "react";
import { orderAPI } from "../../api/api.js";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Package,
  BookOpen,
  Tag,
  DollarSign,
  AlertCircle,
} from "lucide-react";

const BookCatalogPage = () => {
  const [catalog, setCatalog] = useState({});
  const [flatCatalog, setFlatCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [filters, setFilters] = useState({
    bookType: "",
    grade: "",
    search: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    bookType: "ELP",
    grade: "Pre-Nursery",
    name: "",
    code: "",
    description: "",
    defaultPrice: "",
    isCombo: false,
    comboIncludes: [],
    status: "active",
  });

  // Fetch catalog
  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getBookCatalog(filters);
      setCatalog(response.data);
      setFlatCatalog(response.flatData);
    } catch (error) {
      console.error("Error fetching catalog:", error);
      alert("Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchCatalog();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      bookType: "",
      grade: "",
      search: "",
    });
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      bookType: "ELP",
      grade: "Pre-Nursery",
      name: "",
      code: "",
      description: "",
      defaultPrice: "",
      isCombo: false,
      comboIncludes: [],
      status: "active",
    });
    setEditingBook(null);
    setShowForm(false);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBook) {
        await orderAPI.updateBookCatalog(editingBook._id, formData);
        alert("Book updated successfully");
      } else {
        await orderAPI.createBookCatalog(formData);
        alert("Book added to catalog successfully");
      }
      resetForm();
      fetchCatalog();
    } catch (error) {
      console.error("Error saving book:", error);
      alert(`Error: ${error}`);
    }
  };

  // Edit book
  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      bookType: book.bookType,
      grade: book.grade || "",
      name: book.name,
      code: book.code,
      description: book.description || "",
      defaultPrice: book.defaultPrice,
      isCombo: book.isCombo || false,
      comboIncludes: book.comboIncludes || [],
      status: book.status || "active",
    });
    setShowForm(true);
  };

  // Delete book
  const handleDelete = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book from catalog?")) return;

    try {
      await orderAPI.deleteBookCatalog(bookId);
      alert("Book removed from catalog");
      fetchCatalog();
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Failed to delete book");
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Available book types and grades
  const bookTypes = ["ELP", "LTE", "CAC", "CTF", "KITS"];
  const grades = {
    ELP: ["Pre-Nursery", "LKG", "UKG"],
    LTE: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
    CAC: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"],
    CTF: ["Grade 6", "Grade 7", "Grade 8", "Grade 9-12"],
    KITS: ["Combo Kits", "Individual Kits"],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">Book Catalog Management</h1>
              <p className="mt-2 text-blue-200">
                Manage book catalog with default prices and details
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Book
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Type
              </label>
              <select
                value={filters.bookType}
                onChange={(e) => handleFilterChange("bookType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                {bookTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <select
                value={filters.grade}
                onChange={(e) => handleFilterChange("grade", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Grades</option>
                {filters.bookType && grades[filters.bookType] ? (
                  grades[filters.bookType].map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))
                ) : (
                  Object.values(grades).flat().map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-end space-x-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-full"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingBook ? "Edit Book" : "Add New Book"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Book Type *
                      </label>
                      <select
                        value={formData.bookType}
                        onChange={(e) => handleFormChange("bookType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="ELP">ELP</option>
                        <option value="LTE">LTE</option>
                        <option value="CAC">CAC</option>
                        <option value="CTF">CTF</option>
                        <option value="KITS">KITS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <select
                        value={formData.grade}
                        onChange={(e) => handleFormChange("grade", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Grade</option>
                        {formData.bookType === "KITS" ? (
                          <>
                            <option value="Combo Kits">Combo Kits</option>
                            <option value="Individual Kits">Individual Kits</option>
                          </>
                        ) : (
                          grades[formData.bookType]?.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Book Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Book Code *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => handleFormChange("code", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.defaultPrice}
                          onChange={(e) => handleFormChange("defaultPrice", e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="3"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isCombo"
                      checked={formData.isCombo}
                      onChange={(e) => handleFormChange("isCombo", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="isCombo" className="text-sm font-medium text-gray-700">
                      This is a combo pack
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange("status", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingBook ? "Update Book" : "Add Book"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Catalog Display */}
        <div className="space-y-8">
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading catalog...</p>
            </div>
          ) : flatCatalog.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No books found
              </h3>
              <p className="text-gray-600">
                {Object.values(filters).some(v => v) 
                  ? "Try adjusting your filters" 
                  : "Add your first book to the catalog"}
              </p>
            </div>
          ) : (
            Object.entries(catalog).map(([bookType, grades]) => (
              <div key={bookType} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-800 text-white px-6 py-4">
                  <h2 className="text-xl font-bold flex items-center">
                    {bookType === "KITS" ? (
                      <Package className="w-5 h-5 mr-2" />
                    ) : (
                      <BookOpen className="w-5 h-5 mr-2" />
                    )}
                    {bookType}
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {Object.entries(grades).map(([grade, books]) => (
                    <div key={grade}>
                      <div className="bg-gray-50 px-6 py-3">
                        <h3 className="font-medium text-gray-700">{grade}</h3>
                      </div>
                      <div className="px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                          {books.map((book) => (
                            <div
                              key={book._id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {book.name}
                                  </h4>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      <Tag className="w-3 h-3 mr-1" />
                                      {book.code}
                                    </span>
                                    {book.isCombo && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                        Combo Pack
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(book)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(book._id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {book.description}
                              </p>
                              
                              <div className="flex justify-between items-center">
                                <span className="inline-flex items-center text-sm font-semibold text-gray-900">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  {formatCurrency(book.defaultPrice)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  book.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : book.status === "inactive"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {book.status}
                                </span>
                              </div>
                              
                              {book.comboIncludes && book.comboIncludes.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Includes:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {book.comboIncludes.map((item, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                      >
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCatalogPage;