
// frontend/src/pages/OrderManagement/CreateOrderPage.jsx
import React, { useState, useEffect } from "react";
import { orderAPI, schoolAPI } from "../../api/api.js";
import { formatCurrency } from "../../utils/formatters.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState({
    school: "",
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    orderItems: [],
    kitItems: [],
    discountPercentage: 0,
    discountAmount: 0,
    toAddress: {
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      mobile: "",
      email: "",
    },
  });

  // State for UI
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedBookType, setSelectedBookType] = useState("ELP");
  const [selectedGrade, setSelectedGrade] = useState("Pre-Nursery");
  const [individualBooks, setIndividualBooks] = useState([]);
  const [selectedIndividualBook, setSelectedIndividualBook] = useState("");

  // State for ELP combos
  const [elpCombos, setElpCombos] = useState({
    "Pre-Nursery": false,
    LKG: false,
    UKG: false,
  });

  // Available book types
  const bookTypes = [
    { value: "ELP", label: "Early Learning Program (ELP)" },
    { value: "LTE", label: "Little Tech Explorers (LTE)" },
    { value: "CAC", label: "Coding & Computer (CAC)" },
    { value: "CTF", label: "Creative Tech for Future (CTF)" },
  ];

  // Available grades based on book type
  const getGradesForBookType = (type) => {
    switch (type) {
      case "ELP":
        return ["Pre-Nursery", "LKG", "UKG"];
      case "LTE":
        return ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"];
      case "CAC":
        return [
          "Grade 1",
          "Grade 2",
          "Grade 3",
          "Grade 4",
          "Grade 5",
          "Grade 6",
          "Grade 7",
          "Grade 8",
        ];
      case "CTF":
        return ["Grade 6", "Grade 7", "Grade 8", "Grade 9-12"];
      default:
        return [];
    }
  };

  // Available books for ELP grades
  const getELPBooks = (grade) => {
    const books = {
      "Pre-Nursery": [
        "Math O Mania Part-1",
        "Math O Mania Part-2",
        "Alpha O Mania Part-1",
        "Alpha O Mania Part-2",
        "Pyare Axar Part-1",
        "Pyare Axar Part-2",
        "Pyare Axar Part-3",
        "Rhyme Book",
        "Steamheartia",
      ],
      LKG: [
        "Axar Masti Part-1",
        "Axar Masti Part-2",
        "Letter Land Heroes",
        "Number Nuts Part-1",
        "Number Nuts Part-2",
        "Rhyme Book",
        "SoundTopia",
        "Thinky Tots Lab",
      ],
      UKG: [
        "Kahani Kadam Part-1",
        "Kahani Kadam Part-2",
        "Number Bots Part-1",
        "Number Bots Part-2",
        "PenPals Paradise Part-1",
        "SoundSpark Part-1",
        "Rhyme Bunny",
        "Tiny Tinker Lab",
      ],
    };
    return books[grade] || [];
  };

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    // Update individual books list when grade changes
    if (selectedBookType === "ELP") {
      setIndividualBooks(getELPBooks(selectedGrade));
      setSelectedIndividualBook("");
    }
  }, [selectedGrade, selectedBookType]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolAPI.getSchools({ status: "active" });
      setSchools(response.data || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Failed to load schools. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle school selection
  const handleSchoolSelect = (schoolId) => {
    setFormData((prev) => ({ ...prev, school: schoolId }));
    const school = schools.find((s) => s._id === schoolId);
    setSelectedSchool(school);

    // Auto-fill address if school is selected
    if (school) {
      setFormData((prev) => ({
        ...prev,
        toAddress: {
          name: school.contactPersonName || "",
          address: school.address || "",
          city: school.city || "",
          state: school.state || "",
          pincode: school.pincode || "",
          mobile: school.mobile || "",
          email: school.email || "",
        },
      }));
    }
  };

  // Add or update ELP Combo Pack
  const handleELPCombo = (grade) => {
    const existingComboIndex = formData.orderItems.findIndex(
      (item) => item.isComboPack && item.bookType === "ELP" && item.grade === grade
    );

    if (existingComboIndex >= 0) {
      // Update quantity of existing combo
      updateItem(existingComboIndex, "quantity", formData.orderItems[existingComboIndex].quantity + 1, "order");
      toast.success(`${grade} Combo Pack quantity increased`);
    } else {
      // Add new combo
      const newItem = {
        bookType: "ELP",
        grade: grade,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        isComboPack: true,
        isIndividualBook: false,
        bookName: `${grade} Combo Pack`,
      };

      setFormData((prev) => ({
        ...prev,
        orderItems: [...prev.orderItems, newItem],
      }));

      // Update combo state
      setElpCombos((prev) => ({ ...prev, [grade]: true }));
      toast.success(`${grade} Combo Pack added`);
    }
  };

  // Add or update Individual Book
  const handleIndividualBook = () => {
    if (!selectedIndividualBook) {
      toast.error("Please select a book first");
      return;
    }

    const existingBookIndex = formData.orderItems.findIndex(
      (item) =>
        item.isIndividualBook &&
        item.bookType === selectedBookType &&
        item.grade === selectedGrade &&
        item.bookName === selectedIndividualBook
    );

    if (existingBookIndex >= 0) {
      // Update quantity of existing book
      updateItem(
        existingBookIndex,
        "quantity",
        formData.orderItems[existingBookIndex].quantity + 1,
        "order"
      );
      toast.success(`${selectedIndividualBook} quantity increased`);
    } else {
      // Add new individual book
      const newItem = {
        bookType: selectedBookType,
        grade: selectedGrade,
        bookName: selectedIndividualBook,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        isComboPack: false,
        isIndividualBook: true,
      };

      setFormData((prev) => ({
        ...prev,
        orderItems: [...prev.orderItems, newItem],
      }));
      toast.success(`${selectedIndividualBook} added to order`);
    }

    // Reset selection
    setSelectedIndividualBook("");
  };

  // Add or update LTE/CAC/CTF Book
  const handleStandardBook = () => {
    const existingBookIndex = formData.orderItems.findIndex(
      (item) =>
        !item.isComboPack &&
        !item.isIndividualBook &&
        item.bookType === selectedBookType &&
        item.grade === selectedGrade
    );

    if (existingBookIndex >= 0) {
      // Update quantity of existing book
      updateItem(
        existingBookIndex,
        "quantity",
        formData.orderItems[existingBookIndex].quantity + 1,
        "order"
      );
      toast.success(`${selectedBookType} ${selectedGrade} quantity increased`);
    } else {
      // Add new standard book
      const newItem = {
        bookType: selectedBookType,
        grade: selectedGrade,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        isComboPack: false,
        isIndividualBook: false,
      };

      setFormData((prev) => ({
        ...prev,
        orderItems: [...prev.orderItems, newItem],
      }));
      toast.success(`${selectedBookType} ${selectedGrade} added to order`);
    }
  };

  // Add or update Kit
  const handleKit = (kitType, kitName = "") => {
    const kitIdentifier = kitName || kitType;
    const existingKitIndex = formData.kitItems.findIndex(
      (item) =>
        item.kitType === kitType &&
        (kitType !== "Individual Kit" || item.kitName === kitIdentifier)
    );

    if (existingKitIndex >= 0) {
      // Update quantity of existing kit
      updateItem(
        existingKitIndex,
        "quantity",
        formData.kitItems[existingKitIndex].quantity + 1,
        "kit"
      );
      toast.success(`${kitIdentifier} quantity increased`);
    } else {
      // Add new kit
      const newItem = {
        kitType: kitType,
        kitName: kitIdentifier,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      };

      setFormData((prev) => ({
        ...prev,
        kitItems: [...prev.kitItems, newItem],
      }));
      toast.success(`${kitIdentifier} added to order`);
    }
  };

  // Update item quantity or price
  const updateItem = (index, field, value, type = "order") => {
    const items = type === "order" ? [...formData.orderItems] : [...formData.kitItems];
    
    const numericValue = parseFloat(value) || 0;
    items[index][field] = numericValue;

    // Recalculate total price
    if (field === "quantity" || field === "unitPrice") {
      items[index].totalPrice = items[index].quantity * items[index].unitPrice;
    }

    if (type === "order") {
      setFormData((prev) => ({ ...prev, orderItems: items }));
    } else {
      setFormData((prev) => ({ ...prev, kitItems: items }));
    }

    // Recalculate discount amount after item update
    updateDiscountAmount();
  };

  // Remove item
  const removeItem = (index, type = "order") => {
    if (type === "order") {
      const item = formData.orderItems[index];
      // If removing ELP combo, update combo state
      if (item.isComboPack && item.bookType === "ELP") {
        setElpCombos((prev) => ({ ...prev, [item.grade]: false }));
      }

      setFormData((prev) => ({
        ...prev,
        orderItems: prev.orderItems.filter((_, i) => i !== index),
      }));
      
      toast.success(`${item.bookName || `${item.bookType} ${item.grade}`} removed`);
    } else {
      const item = formData.kitItems[index];
      setFormData((prev) => ({
        ...prev,
        kitItems: prev.kitItems.filter((_, i) => i !== index),
      }));
      
      toast.success(`${item.kitName} removed`);
    }
    
    // Recalculate discount amount after removal
    updateDiscountAmount();
  };

  // Add custom individual kit
  const addCustomKit = () => {
    const newKit = {
      kitType: "Individual Kit",
      kitName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };

    setFormData((prev) => ({
      ...prev,
      kitItems: [...prev.kitItems, newKit],
    }));
    
    toast.success("Individual kit added. Please enter kit name.");
  };

  // Update custom kit name
  const updateKitName = (index, value) => {
    const items = [...formData.kitItems];
    items[index].kitName = value;
    setFormData((prev) => ({ ...prev, kitItems: items }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const orderTotal = formData.orderItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
    const kitTotal = formData.kitItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
    const subtotal = orderTotal + kitTotal;
    const discountAmount = (formData.discountPercentage / 100) * subtotal;
    const total = Math.max(0, subtotal - discountAmount);

    return { orderTotal, kitTotal, subtotal, discountAmount, total };
  };

  const { orderTotal, kitTotal, subtotal, discountAmount, total } = calculateTotals();

  // Update discount amount based on percentage
  const updateDiscountAmount = () => {
    const { subtotal } = calculateTotals();
    const discountAmt = (formData.discountPercentage / 100) * subtotal;
    setFormData(prev => ({
      ...prev,
      discountAmount: discountAmt
    }));
  };

  // Handle discount percentage change
  const handleDiscountPercentageChange = (value) => {
    const percentage = Math.min(100, Math.max(0, parseFloat(value) || 0));
    const { subtotal } = calculateTotals();
    const discountAmt = (percentage / 100) * subtotal;

    setFormData(prev => ({
      ...prev,
      discountPercentage: percentage,
      discountAmount: discountAmt
    }));
    
    if (percentage > 0) {
      toast.success(`Discount applied: ${percentage}% (${formatCurrency(discountAmt)})`);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.school) {
      toast.error("Please select a school");
      return;
    }

    if (formData.orderItems.length === 0 && formData.kitItems.length === 0) {
      toast.error("Please add at least one book or kit");
      return;
    }

    // Check if all items have unit price
    const itemsWithoutPrice = formData.orderItems.filter(item => item.unitPrice <= 0);
    if (itemsWithoutPrice.length > 0) {
      toast.error("Please set unit price for all book items");
      return;
    }

    const kitsWithoutPrice = formData.kitItems.filter(item => item.unitPrice <= 0);
    if (kitsWithoutPrice.length > 0) {
      toast.error("Please set unit price for all kit items");
      return;
    }

    // Validate kit items
    const invalidKit = formData.kitItems.find(
      (kit) => kit.kitType === "Individual Kit" && !kit.kitName?.trim()
    );

    if (invalidKit) {
      toast.error("Please enter a name for individual kits");
      return;
    }

    // Prepare data for backend - send discount percentage to backend
    const orderData = {
      school: formData.school,
      academicYear: formData.academicYear,
      orderItems: formData.orderItems.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      })),
      kitItems: formData.kitItems.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      })),
      discountPercentage: formData.discountPercentage,
      discountAmount: discountAmount,
      toAddress: formData.toAddress
    };

    setLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Creating order...");

    try {
      const response = await orderAPI.createOrder(orderData);
      
      // Update toast to success
      toast.success("Order created successfully!", {
        id: loadingToast,
        duration: 3000,
      });
      
      // Reset form
      setFormData({
        school: "",
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        orderItems: [],
        kitItems: [],
        discountPercentage: 0,
        discountAmount: 0,
        toAddress: {
          name: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          mobile: "",
          email: "",
        },
      });
      setSelectedSchool(null);
      setElpCombos({
        "Pre-Nursery": false,
        LKG: false,
        UKG: false,
      });
      
      // Navigate to order detail page after a short delay
      setTimeout(() => {
        if (response.data?._id) {
          navigate(`/orders/${response.data._id}`);
        } else {
          navigate('/orders');
        }
      }, 1500);
      
    }catch (error) {
    console.error("Error creating order:", error);
    
    // FIXED ERROR HANDLING
    let errorMessage = "Failed to create order. Please try again.";
    
    // Since your API returns string error, handle it as string
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      // In case error is object (for other API calls)
      errorMessage = error.message || JSON.stringify(error);
    }
    
    // Check for specific error messages
    if (errorMessage.includes("School already has an active order")) {
      errorMessage = "This school already has an active order. Please complete or cancel the existing order first.";
    } else if (errorMessage.includes("At least one book or kit is required")) {
      errorMessage = "Please add at least one book or kit to create order";
    } else if (errorMessage.includes("School not found")) {
      errorMessage = "Selected school not found. Please refresh the page and try again.";
    }
    
    // Update toast with specific error message
    toast.error(errorMessage, {
      id: loadingToast,
      duration: 5000,
    });
    
  } finally {
    setLoading(false);
  }
  };

  // Add all individual books for current grade
  const addAllIndividualBooks = () => {
    const books = getELPBooks(selectedGrade);
    let addedCount = 0;
    
    books.forEach(book => {
      const existingIndex = formData.orderItems.findIndex(
        item => item.isIndividualBook && 
                item.bookType === "ELP" && 
                item.grade === selectedGrade && 
                item.bookName === book
      );

      if (existingIndex >= 0) {
        updateItem(existingIndex, "quantity", formData.orderItems[existingIndex].quantity + 1, "order");
        addedCount++;
      } else {
        const newItem = {
          bookType: "ELP",
          grade: selectedGrade,
          bookName: book,
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          isComboPack: false,
          isIndividualBook: true,
        };
        setFormData(prev => ({
          ...prev,
          orderItems: [...prev.orderItems, newItem]
        }));
        addedCount++;
      }
    });
    
    setSelectedIndividualBook("");
    updateDiscountAmount();
    
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} individual books for ${selectedGrade}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">
                Create New Order
              </h1>
              <p className="mt-2 text-blue-200">
                Fill in the details to create a new order
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              View All Orders
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* School Selection Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Select School
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School *
                </label>
                <select
                  value={formData.school}
                  onChange={(e) => handleSchoolSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a school</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name} - {school.city}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSchool && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Selected School Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Contact:</span>{" "}
                      {selectedSchool.contactPersonName}
                    </div>
                    <div>
                      <span className="text-gray-600">Mobile:</span>{" "}
                      {selectedSchool.mobile}
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>{" "}
                      {selectedSchool.email}
                    </div>
                    <div>
                      <span className="text-gray-600">Address:</span>{" "}
                      {selectedSchool.address}, {selectedSchool.city}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Books Section Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              2. Add Books
            </h2>

            {/* Book Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Book Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {bookTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setSelectedBookType(type.value);
                      setSelectedGrade(getGradesForBookType(type.value)[0]);
                      setSelectedIndividualBook("");
                    }}
                    className={`px-4 py-3 rounded-lg border text-center transition-colors ${
                      selectedBookType === type.value
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Book Type Specific Forms */}
            <div className="space-y-6">
              {/* ELP Books */}
              {selectedBookType === "ELP" && (
                <div className="space-y-4">
                  {/* ELP Combo Packs */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h3 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Combo Packs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {getGradesForBookType("ELP").map((grade) => (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => handleELPCombo(grade)}
                          className={`px-4 py-3 rounded-lg border text-center transition-colors flex flex-col items-center justify-center ${
                            elpCombos[grade]
                              ? "bg-green-100 border-green-300 text-green-800 shadow-sm"
                              : "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 hover:shadow-sm"
                          }`}
                        >
                          <div className="font-medium">{grade} Combo Pack</div>
                          <div className="text-sm mt-1">Set price manually</div>
                          {elpCombos[grade] && (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Added
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Grade
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => {
                        setSelectedGrade(e.target.value);
                        setSelectedIndividualBook("");
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getGradesForBookType("ELP").map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Individual ELP Books */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Individual Books
                    </h3>
                    <div className="flex space-x-4">
                      <select
                        value={selectedIndividualBook}
                        onChange={(e) =>
                          setSelectedIndividualBook(e.target.value)
                        }
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a book</option>
                        {individualBooks.map((book) => (
                          <option key={book} value={book}>
                            {book}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleIndividualBook}
                        disabled={!selectedIndividualBook}
                        className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
                          selectedIndividualBook
                            ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={addAllIndividualBooks}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add All Books Individually
                    </button>
                  </div>
                </div>
              )}

              {/* LTE, CAC, CTF Books */}
              {(selectedBookType === "LTE" ||
                selectedBookType === "CAC" ||
                selectedBookType === "CTF") && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Grade
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getGradesForBookType(selectedBookType).map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleStandardBook}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Book
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {selectedBookType} {selectedGrade} - Set price manually
                  </div>
                </div>
              )}
            </div>

            {/* Added Books List */}
            {formData.orderItems.length > 0 && (
              <div className="mt-8">
                <h3 className="font-medium text-gray-800 mb-3">Added Books</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Grade/Book
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.orderItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.bookType === 'ELP' ? 'bg-blue-100 text-blue-800' :
                              item.bookType === 'LTE' ? 'bg-green-100 text-green-800' :
                              item.bookType === 'CAC' ? 'bg-purple-100 text-purple-800' :
                              'bg-pink-100 text-pink-800'
                            }`}>
                              {item.bookType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium">
                              {item.isComboPack
                                ? `${item.grade} Combo Pack`
                                : item.bookName ||
                                  `${item.bookType} ${item.grade}`}
                            </div>
                            {item.isComboPack && (
                              <div className="text-xs text-gray-500 mt-1">Combo Pack</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  e.target.value,
                                  "order",
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-gray-500">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "unitPrice",
                                    e.target.value,
                                    "order",
                                  )
                                }
                                className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatCurrency(item.totalPrice)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(index, "order")}
                              className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Kits Section Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              3. Add Kits
            </h2>

            {/* Predefined Kits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                type="button"
                onClick={() => handleKit("Wonder Kit")}
                className="px-6 py-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-center transition-colors hover:shadow-sm"
              >
                <div className="font-medium text-purple-800">Wonder Kit</div>
                <div className="text-sm text-purple-600 mt-1">Set price manually</div>
              </button>

              <button
                type="button"
                onClick={() => handleKit("Nexus Kit")}
                className="px-6 py-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-center transition-colors hover:shadow-sm"
              >
                <div className="font-medium text-indigo-800">Nexus Kit</div>
                <div className="text-sm text-indigo-600 mt-1">Set price manually</div>
              </button>

              <button
                type="button"
                onClick={addCustomKit}
                className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-center transition-colors hover:shadow-sm"
              >
                <div className="font-medium text-gray-800">Individual Kit</div>
                <div className="text-sm text-gray-600 mt-1">Custom kit name</div>
              </button>
            </div>

            {/* Added Kits List */}
            {formData.kitItems.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Added Kits</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Kit Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Kit Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.kitItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.kitType === 'Wonder Kit' ? 'bg-purple-100 text-purple-800' :
                              item.kitType === 'Nexus Kit' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.kitType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {item.kitType === "Individual Kit" ? (
                              <input
                                type="text"
                                value={item.kitName}
                                onChange={(e) =>
                                  updateKitName(index, e.target.value)
                                }
                                placeholder="Enter kit name"
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-sm">{item.kitName}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  e.target.value,
                                  "kit",
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-gray-500">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "unitPrice",
                                    e.target.value,
                                    "kit",
                                  )
                                }
                                className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatCurrency(item.totalPrice)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(index, "kit")}
                              className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Address & Totals Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              4. Address & Totals
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shipping Address */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4">
                  Shipping Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.toAddress.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          toAddress: {
                            ...prev.toAddress,
                            name: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      value={formData.toAddress.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          toAddress: {
                            ...prev.toAddress,
                            address: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.toAddress.city}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            toAddress: {
                              ...prev.toAddress,
                              city: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={formData.toAddress.pincode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            toAddress: {
                              ...prev.toAddress,
                              pincode: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile *
                      </label>
                      <input
                        type="tel"
                        value={formData.toAddress.mobile}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            toAddress: {
                              ...prev.toAddress,
                              mobile: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.toAddress.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            toAddress: {
                              ...prev.toAddress,
                              email: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4">
                  Order Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Books Total:</span>
                      <span className="font-medium text-lg">
                        {formatCurrency(orderTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Kits Total:</span>
                      <span className="font-medium text-lg">
                        {formatCurrency(kitTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                      <span className="text-gray-700 font-medium">Subtotal:</span>
                      <span className="font-bold text-xl">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    
                    {/* Discount Percentage Input */}
                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-700 font-medium">Discount:</span>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.discountPercentage}
                            onChange={(e) => handleDiscountPercentageChange(e.target.value)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                          <span className="absolute right-8 top-2 text-gray-500">%</span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          = {formatCurrency(discountAmount)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                      <span className="text-lg font-semibold text-gray-900">
                        Total Amount:
                      </span>
                      <span className="text-3xl font-bold text-blue-600">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading || (formData.orderItems.length === 0 && formData.kitItems.length === 0)}
                    className={`w-full py-4 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      loading || (formData.orderItems.length === 0 && formData.kitItems.length === 0)
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Order
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {formData.orderItems.length === 0 && formData.kitItems.length === 0
                      ? "Add at least one book or kit to create order"
                      : "Order will be created with discount percentage"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderPage;