import React, { useState, useEffect, useCallback } from "react";
import { orderAPI, schoolAPI } from "../../api/api.js";
import { formatCurrency } from "../../utils/formatters.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BOOK_CATALOG, KIT_CATALOG } from "../data/catalogData.js";

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
    gstPercentage: 18,
    gstAmount: 0,
    toAddress: {
      name: "",
      address: "",
      city: "",
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

  const getGradesForBookType = (type) => {
    return Object.keys(BOOK_CATALOG[type] || {});
  };

  // Available books for ELP grades
  const getELPBooks = (grade) => {
    return BOOK_CATALOG.ELP[grade]?.books || [];
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

  // Memoized calculate totals function
  const calculateTotals = useCallback(() => {
    const orderTotal = formData.orderItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0,
    );
    const kitTotal = formData.kitItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0,
    );
    const subtotal = orderTotal + kitTotal;
    const discountAmount = (formData.discountPercentage / 100) * subtotal;
    const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
    const gstAmount = (formData.gstPercentage / 100) * amountAfterDiscount;
    const total = amountAfterDiscount + gstAmount;

    return { orderTotal, kitTotal, subtotal, discountAmount, gstAmount, total };
  }, [
    formData.orderItems,
    formData.kitItems,
    formData.discountPercentage,
    formData.gstPercentage,
  ]);

  // Update form data when totals change
  const updateTotals = useCallback(() => {
    const { discountAmount, gstAmount, total } = calculateTotals();
    setFormData((prev) => ({
      ...prev,
      discountAmount,
      gstAmount,
    }));
  }, [calculateTotals]);

  // Update totals when relevant data changes
  useEffect(() => {
    updateTotals();
  }, [
    formData.orderItems,
    formData.kitItems,
    formData.discountPercentage,
    formData.gstPercentage,
    updateTotals,
  ]);

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
          mobile: school.mobile || "",
          email: school.email || "",
        },
      }));
    }
  };

  // Add or update ELP Combo Pack
  const handleELPCombo = (grade) => {
    const existingComboIndex = formData.orderItems.findIndex(
      (item) =>
        item.isComboPack && item.bookType === "ELP" && item.grade === grade,
    );

    if (existingComboIndex >= 0) {
      // Update quantity of existing combo
      updateItem(
        existingComboIndex,
        "quantity",
        formData.orderItems[existingComboIndex].quantity + 1,
        "order",
      );
      toast.success(`${grade} Combo Pack quantity increased`);
    } else {
      const comboPrice = BOOK_CATALOG.ELP[grade].comboPrice;

const newItem = {
  bookType: "ELP",
  grade: grade,
  quantity: 1,
  unitPrice: comboPrice,
  totalPrice: comboPrice,
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
        item.bookName === selectedIndividualBook,
    );

    if (existingBookIndex >= 0) {
      // Update quantity of existing book
      updateItem(
        existingBookIndex,
        "quantity",
        formData.orderItems[existingBookIndex].quantity + 1,
        "order",
      );
      toast.success(`${selectedIndividualBook} quantity increased`);
    } else {
      const bookData =
  BOOK_CATALOG.ELP[selectedGrade].books.find(
    (b) => b.name === selectedIndividualBook
  );

const price = bookData?.price || 0;

const newItem = {
  bookType: selectedBookType,
  grade: selectedGrade,
  bookName: selectedIndividualBook,
  quantity: 1,
  unitPrice: price,
  totalPrice: price,
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
        item.grade === selectedGrade,
    );

    if (existingBookIndex >= 0) {
      // Update quantity of existing book
      updateItem(
        existingBookIndex,
        "quantity",
        formData.orderItems[existingBookIndex].quantity + 1,
        "order",
      );
      toast.success(`${selectedBookType} ${selectedGrade} quantity increased`);
    } else {
      const price =
  BOOK_CATALOG[selectedBookType][selectedGrade] || 0;

const newItem = {
  bookType: selectedBookType,
  grade: selectedGrade,
  quantity: 1,
  unitPrice: price,
  totalPrice: price,
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
        (kitType !== "Individual Kit" || item.kitName === kitIdentifier),
    );

    if (existingKitIndex >= 0) {
      // Update quantity of existing kit
      updateItem(
        existingKitIndex,
        "quantity",
        formData.kitItems[existingKitIndex].quantity + 1,
        "kit",
      );
      toast.success(`${kitIdentifier} quantity increased`);
    } else {
      const price = KIT_CATALOG[kitType] || 0;

const newItem = {
  kitType: kitType,
  kitName: kitIdentifier,
  quantity: 1,
  unitPrice: price,
  totalPrice: price,
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
    const items =
      type === "order" ? [...formData.orderItems] : [...formData.kitItems];

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

      toast.success(
        `${item.bookName || `${item.bookType} ${item.grade}`} removed`,
      );
    } else {
      const item = formData.kitItems[index];
      setFormData((prev) => ({
        ...prev,
        kitItems: prev.kitItems.filter((_, i) => i !== index),
      }));

      toast.success(`${item.kitName} removed`);
    }
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

  // Calculate current totals for display
  const { orderTotal, kitTotal, subtotal, discountAmount, gstAmount, total } =
    calculateTotals();

  // Handle discount percentage change
  const handleDiscountPercentageChange = (value) => {
    const percentage = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setFormData((prev) => ({
      ...prev,
      discountPercentage: percentage,
    }));

    if (percentage > 0) {
      toast.success(`Discount applied: ${percentage}%`);
    }
  };

  // Handle GST percentage change
  const handleGSTPercentageChange = (value) => {
    const percentage = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setFormData((prev) => ({
      ...prev,
      gstPercentage: percentage,
    }));

    if (percentage > 0) {
      toast.success(`GST updated: ${percentage}%`);
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
    const itemsWithoutPrice = formData.orderItems.filter(
      (item) => item.unitPrice <= 0,
    );
    if (itemsWithoutPrice.length > 0) {
      toast.error("Please set unit price for all book items");
      return;
    }

    const kitsWithoutPrice = formData.kitItems.filter(
      (item) => item.unitPrice <= 0,
    );
    if (kitsWithoutPrice.length > 0) {
      toast.error("Please set unit price for all kit items");
      return;
    }

    // Validate kit items
    const invalidKit = formData.kitItems.find(
      (kit) => kit.kitType === "Individual Kit" && !kit.kitName?.trim(),
    );

    if (invalidKit) {
      toast.error("Please enter a name for individual kits");
      return;
    }

    // Prepare data for backend - send discount percentage and GST to backend
    const orderData = {
      school: formData.school,
      academicYear: formData.academicYear,
      orderItems: formData.orderItems.map((item) => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      })),
      kitItems: formData.kitItems.map((item) => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      })),
      discountPercentage: formData.discountPercentage,
      discountAmount: discountAmount,
      gstPercentage: formData.gstPercentage,
      gstAmount: gstAmount,
      totalAmount: total,
      toAddress: formData.toAddress,
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
        gstPercentage: 18,
        gstAmount: 0,
        toAddress: {
          name: "",
          address: "",
          city: "",
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
          navigate("/orders");
        }
      }, 1500);
    } catch (error) {
      console.error("Error creating order:", error);

      // ERROR HANDLING
      let errorMessage = "Failed to create order. Please try again.";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        errorMessage = error.message || JSON.stringify(error);
      }

      // Check for specific error messages
      if (errorMessage.includes("School already has an active order")) {
        errorMessage =
          "This school already has an active order. Please complete or cancel the existing order first.";
      } else if (
        errorMessage.includes("At least one book or kit is required")
      ) {
        errorMessage = "Please add at least one book or kit to create order";
      } else if (errorMessage.includes("School not found")) {
        errorMessage =
          "Selected school not found. Please refresh the page and try again.";
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

  books.forEach((book) => {
    const existingIndex = formData.orderItems.findIndex(
      (item) =>
        item.isIndividualBook &&
        item.bookType === "ELP" &&
        item.grade === selectedGrade &&
        item.bookName === book.name
    );

    if (existingIndex >= 0) {
      updateItem(
        existingIndex,
        "quantity",
        formData.orderItems[existingIndex].quantity + 1,
        "order"
      );
    } else {
      const newItem = {
        bookType: "ELP",
        grade: selectedGrade,
        bookName: book.name,
        quantity: 1,
        unitPrice: book.price,
        totalPrice: book.price,
        isComboPack: false,
        isIndividualBook: true,
      };

      setFormData((prev) => ({
        ...prev,
        orderItems: [...prev.orderItems, newItem],
      }));
    }

    addedCount++;
  });

  setSelectedIndividualBook("");

  toast.success(`Added ${addedCount} books for ${selectedGrade}`);
};


  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA8E0A]/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-8">Create New Order</h1>
                <p className="text-lg text-blue-200 mb-6">
                  Fill in the details to create a new order
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-[#EA8E0A] text-sm font-medium mb-1">
                      Total Items
                    </p>
                    <p className="text-2xl font-semibold">
                      {formData.orderItems.length + formData.kitItems.length}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-[#EA8E0A] text-sm font-medium mb-1">
                      Order Value
                    </p>
                    <p className="text-2xl font-semibold">
                      {formatCurrency(total)}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/orders")}
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                View All Orders
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* School Selection Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-10 h-10 bg-[#0B234A]/10 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-[#0B234A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              1. Select School
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  School *
                </label>
                <select
                  value={formData.school}
                  onChange={(e) => handleSchoolSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
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
                <div className="bg-gradient-to-r from-[#0B234A]/5 to-[#0B234A]/10 rounded-xl p-6 border border-[#0B234A]/20">
                  <h3 className="font-bold text-[#0B234A] mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Selected School Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Contact Person
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedSchool.contactPersonName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Mobile
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedSchool.mobile}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedSchool.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Address
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedSchool.address}, {selectedSchool.city},
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Books Section Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-10 h-10 bg-[#EA8E0A]/10 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-[#EA8E0A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              2. Add Books
            </h2>

            {/* Book Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                    className={`px-4 py-4 rounded-xl border-2 text-center transition-all duration-300 ${
                      selectedBookType === type.value
                        ? "border-[#0B234A] bg-[#0B234A]/10 text-[#0B234A] shadow-lg transform scale-[1.02]"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
                    }`}
                  >
                    <div className="font-bold text-sm md:text-base">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Book Type Specific Forms */}
            <div className="space-y-8">
              {/* ELP Books */}
              {selectedBookType === "ELP" && (
                <div className="space-y-6">
                  {/* ELP Combo Packs */}
                  <div className="bg-gradient-to-r from-[#FFF3CD] to-[#FFF8E1] rounded-xl p-6 border border-[#EA8E0A]/30">
                    <h3 className="font-bold text-[#856404] mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        />
                      </svg>
                      Combo Packs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {getGradesForBookType("ELP").map((grade) => (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => handleELPCombo(grade)}
                          className={`px-4 py-4 rounded-xl border-2 text-center transition-all duration-300 flex flex-col items-center justify-center ${
                            elpCombos[grade]
                              ? "border-green-500 bg-green-50 text-green-800 shadow-lg transform scale-[1.02]"
                              : "border-[#EA8E0A] bg-white text-[#856404] hover:bg-yellow-50 hover:shadow-md"
                          }`}
                        >
                          <div className="font-bold text-base">
                            {grade} Combo Pack
                          </div>
                          {elpCombos[grade] && (
                            <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Added
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <label className="block text-sm font-semibold text-gray-700">
                          Select Grade
                        </label>
                        <select
                          value={selectedGrade}
                          onChange={(e) => {
                            setSelectedGrade(e.target.value);
                            setSelectedIndividualBook("");
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                        >
                          {getGradesForBookType("ELP").map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-auto">
                        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                          <div className="flex-1">
                            <select
                              value={selectedIndividualBook}
                              onChange={(e) =>
                                setSelectedIndividualBook(e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                            >
                              <option value="">Select a book</option>
                              {individualBooks.map((book) => (
                                <option key={book.name} value={book.name}>
                                  {book.name} (₹{book.price})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={handleIndividualBook}
                              disabled={!selectedIndividualBook}
                              className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                                selectedIndividualBook
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add Book
                            </button>
                            <button
                              type="button"
                              onClick={addAllIndividualBooks}
                              className="px-6 py-2 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] hover:from-[#1a3a6a] hover:to-[#0B234A] text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              Add All
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addAllIndividualBooks}
                          className="mt-3 text-sm text-[#0B234A] hover:text-[#1a3a6a] transition-colors flex items-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add All Books Individually
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LTE, CAC, CTF Books */}
              {(selectedBookType === "LTE" ||
                selectedBookType === "CAC" ||
                selectedBookType === "CTF") && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <label className="block text-sm font-semibold text-gray-700">
                        Select Grade
                      </label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                      >
                        {getGradesForBookType(selectedBookType).map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleStandardBook}
                      className="px-6 py-3 bg-gradient-to-r from-[#EA8E0A] to-[#F5A623] hover:from-[#F5A623] hover:to-[#EA8E0A] text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add {selectedBookType} Book
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2 mt-4">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {selectedBookType} {selectedGrade} 
                  </div>
                </div>
              )}
            </div>

            {/* Added Books List */}
            {formData.orderItems.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-[#0B234A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m7 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Added Books ({formData.orderItems.length})
                </h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Grade/Book
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.orderItems.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                item.bookType === "ELP"
                                  ? "bg-blue-100 text-blue-800"
                                  : item.bookType === "LTE"
                                    ? "bg-green-100 text-green-800"
                                    : item.bookType === "CAC"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-pink-100 text-pink-800"
                              }`}
                            >
                              {item.bookType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">
                              {item.isComboPack
                                ? `${item.grade} Combo Pack`
                                : item.bookName ||
                                  `${item.bookType} ${item.grade}`}
                            </div>
                            {item.isComboPack && (
                              <div className="text-xs text-gray-500 mt-1">
                                Combo Pack
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
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
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A]"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 font-bold text-gray-500">
                                ₹
                              </span>
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
                                className="w-32 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A]"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-base font-bold text-[#0B234A]">
                              {formatCurrency(item.totalPrice)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => removeItem(index, "order")}
                              className="text-[#E22213] hover:text-red-800 transition-colors flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
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
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-10 h-10 bg-[#E22213]/10 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-[#E22213]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              3. Add Kits
            </h2>

            {/* Predefined Kits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                type="button"
                onClick={() => handleKit("Wonder Kit")}
                className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl hover:border-purple-400 hover:shadow-lg text-center transition-all duration-300 group"
              >
                <div className="font-bold text-lg text-purple-800 mb-2">
                  Wonder Kit
                </div>
                
              </button>

              <button
                type="button"
                onClick={() => handleKit("Nexus Kit")}
                className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300 rounded-xl hover:border-indigo-400 hover:shadow-lg text-center transition-all duration-300 group"
              >
                <div className="font-bold text-lg text-indigo-800 mb-2">
                  Nexus Kit
                </div>
                
              </button>

              <button
                type="button"
                onClick={addCustomKit}
                className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:shadow-lg text-center transition-all duration-300 group"
              >
                <div className="font-bold text-lg text-gray-800 mb-2">
                  Individual Kit
                </div>
                <div className="text-sm text-gray-600">Custom kit name</div>
              </button>
            </div>

            {/* Added Kits List */}
            {formData.kitItems.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-[#0B234A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m7 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Added Kits ({formData.kitItems.length})
                </h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Kit Type
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Kit Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.kitItems.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                item.kitType === "Wonder Kit"
                                  ? "bg-purple-100 text-purple-800"
                                  : item.kitType === "Nexus Kit"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.kitType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.kitType === "Individual Kit" ? (
                              <input
                                type="text"
                                value={item.kitName}
                                onChange={(e) =>
                                  updateKitName(index, e.target.value)
                                }
                                placeholder="Enter kit name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A]"
                              />
                            ) : (
                              <span className="font-semibold text-gray-900">
                                {item.kitName}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
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
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A]"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 font-bold text-gray-500">
                                ₹
                              </span>
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
                                className="w-32 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A]"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-base font-bold text-[#0B234A]">
                              {formatCurrency(item.totalPrice)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => removeItem(index, "kit")}
                              className="text-[#E22213] hover:text-red-800 transition-colors flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
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
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-10 h-10 bg-[#0B234A]/10 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-[#0B234A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              4. Address & Totals
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shipping Address */}
              <div>
                <h3 className="font-bold text-[#0B234A] mb-6 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Shipping Address
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                      required
                    />
                  </div>
                  <div className="">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B234A]/50 focus:border-[#0B234A] bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-bold text-[#0B234A] mb-6 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Order Summary
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">Books Total:</span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(orderTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">Kits Total:</span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(kitTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-bold">Subtotal:</span>
                      <span className="font-bold text-lg text-[#0B234A]">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    {/* Discount Percentage Input */}
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">
                        Discount:
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.discountPercentage}
                            onChange={(e) =>
                              handleDiscountPercentageChange(e.target.value)
                            }
                            className="w-28 px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#EA8E0A]/50 focus:border-[#EA8E0A]"
                            placeholder="0"
                          />
                          <span className="absolute right-10 top-2.5 text-gray-500 font-bold">
                            %
                          </span>
                        </div>
                        <div className="text-base font-semibold text-[#E22213]">
                          -{formatCurrency(discountAmount)}
                        </div>
                      </div>
                    </div>

                    {/* GST Percentage Input */}
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">GST:</span>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.gstPercentage}
                            onChange={(e) =>
                              handleGSTPercentageChange(e.target.value)
                            }
                            className="w-28 px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                            placeholder="18"
                          />
                          <span className="absolute right-10 top-2.5 text-gray-500 font-bold">
                            %
                          </span>
                        </div>
                        <div className="text-base font-semibold text-green-600">
                          +{formatCurrency(gstAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-3 border-t border-gray-300 pt-4">
                      <span className="text-xl font-bold text-gray-900">
                        Total Amount:
                      </span>
                      <span className="text-3xl font-bold text-[#0B234A]">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        (formData.orderItems.length === 0 &&
                          formData.kitItems.length === 0)
                      }
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                        loading ||
                        (formData.orderItems.length === 0 &&
                          formData.kitItems.length === 0)
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] hover:from-[#1a3a6a] hover:to-[#0B234A] text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating Order...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Create Order
                        </>
                      )}
                    </button>
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      {formData.orderItems.length === 0 &&
                      formData.kitItems.length === 0
                        ? "Add at least one book or kit to create order"
                        : "Order will be created with discount and GST"}
                    </p>
                  </div>
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
