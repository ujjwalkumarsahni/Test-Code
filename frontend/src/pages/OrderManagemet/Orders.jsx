// frontend/src/pages/CreateOrderPage.jsx
import React, { useState, useEffect } from "react";
import { orderAPI, schoolAPI } from "../../api/api.js";

const CreateOrderPage = () => {
  // State for form data
  const [formData, setFormData] = useState({
    school: "",
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    orderItems: [],
    kitItems: [],
    discount: 0,
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

  // Default prices
  const getDefaultPrice = (bookType, grade, bookName = "") => {
    const prices = {
      ELP: {
        "Pre-Nursery": 1200, // Combo price
        LKG: 1300,
        UKG: 1400,
        individual: 150,
      },
      LTE: {
        "Grade 1": 250,
        "Grade 2": 250,
        "Grade 3": 250,
        "Grade 4": 250,
        "Grade 5": 250,
      },
      CAC: {
        "Grade 1": 300,
        "Grade 2": 300,
        "Grade 3": 300,
        "Grade 4": 300,
        "Grade 5": 300,
        "Grade 6": 300,
        "Grade 7": 300,
        "Grade 8": 300,
      },
      CTF: {
        "Grade 6": 350,
        "Grade 7": 350,
        "Grade 8": 350,
        "Grade 9-12": 400,
      },
      KIT: {
        "Wonder Kit": 500,
        "Nexus Kit": 600,
        "Individual Kit": 750,
      },
    };

    if (bookType === "ELP" && bookName) {
      return prices.ELP.individual;
    }

    return prices[bookType]?.[grade] || 0;
  };

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await schoolAPI.getSchools({ status: "active" });
      setSchools(response.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
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
          name: school.contactPersonName,
          address: school.address,
          city: school.city,
          state: "",
          pincode: "",
          mobile: school.mobile,
          email: school.email,
        },
      }));
    }
  };

  // Add ELP Combo Pack
  const addELPCombo = (grade) => {
    const price = getDefaultPrice("ELP", grade);
    const newItem = {
      bookType: "ELP",
      grade: grade,
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
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
  };

  // Add Individual Book
  const addIndividualBook = () => {
    if (!selectedIndividualBook) return;

    const price = getDefaultPrice(
      selectedBookType,
      selectedGrade,
      selectedIndividualBook,
    );
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

    // Reset selection
    setSelectedIndividualBook("");
  };

  // Add LTE/CAC/CTF Book
  const addStandardBook = () => {
    const price = getDefaultPrice(selectedBookType, selectedGrade);
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
  };

  // Add Kit
  const addKit = (kitType, kitName = "") => {
    const price = getDefaultPrice("KIT", kitType);
    const newItem = {
      kitType: kitType,
      kitName: kitName || kitType,
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    };

    setFormData((prev) => ({
      ...prev,
      kitItems: [...prev.kitItems, newItem],
    }));
  };

  // Update item quantity or price
  const updateItem = (index, field, value, type = "order") => {
    const items =
      type === "order" ? [...formData.orderItems] : [...formData.kitItems];
    items[index][field] = parseFloat(value) || 0;

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
    } else {
      setFormData((prev) => ({
        ...prev,
        kitItems: prev.kitItems.filter((_, i) => i !== index),
      }));
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
      (sum, item) => sum + item.totalPrice,
      0,
    );
    const kitTotal = formData.kitItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    const subtotal = orderTotal + kitTotal;
    const total = Math.max(0, subtotal - formData.discount);

    return { orderTotal, kitTotal, subtotal, total };
  };

  const { orderTotal, kitTotal, subtotal, total } = calculateTotals();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.school) {
      alert("Please select a school");
      return;
    }

    if (formData.orderItems.length === 0) {
      alert("Please add at least one book");
      return;
    }

    // Validate kit items
    const invalidKit = formData.kitItems.find(
      (kit) => kit.kitType === "Individual Kit" && !kit.kitName.trim(),
    );

    if (invalidKit) {
      alert("Please enter a name for individual kits");
      return;
    }

    setLoading(true);

    try {
      const response = await orderAPI.createOrder(formData);
      alert("Order created successfully!");
      console.log("Order created:", response.data);

      // Reset form
      setFormData({
        school: "",
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        orderItems: [],
        kitItems: [],
        discount: 0,
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
    } catch (error) {
      console.error("Error creating order:", error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4">
        {/* header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">
                Create New Order for School
              </h1>
              <p className="mt-2 text-blue-200">
                Fill in the details to create a new order
              </p>
            </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-800">
                    Selected School Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
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
                    className={`px-4 py-3 rounded-md border text-center  ${
                      selectedBookType === type.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:bg-gray-50"
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
                  <div className=" p-4 rounded-md">
                    <h3 className="font-medium text-yellow-800 mb-3">
                      Combo Packs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {getGradesForBookType("ELP").map((grade) => (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => addELPCombo(grade)}
                          disabled={elpCombos[grade]}
                          className={`px-4 py-3 rounded-md border text-center ${
                            elpCombos[grade]
                              ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                              : "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                          }`}
                        >
                          <div className="font-medium">{grade} Combo Pack</div>
                          <div className="text-sm mt-1">
                            {formatCurrency(getDefaultPrice("ELP", grade))}
                          </div>
                          {elpCombos[grade] && (
                            <div className="text-xs text-green-600 mt-1">
                              ✓ Added
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
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {getGradesForBookType("ELP").map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Individual ELP Books */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-3">
                      Individual Books
                    </h3>
                    <div className="flex space-x-4">
                      <select
                        value={selectedIndividualBook}
                        onChange={(e) =>
                          setSelectedIndividualBook(e.target.value)
                        }
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a book</option>
                        {getELPBooks(selectedGrade).map((book) => (
                          <option key={book} value={book}>
                            {book}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addIndividualBook}
                        disabled={!selectedIndividualBook}
                        className={`px-6 py-2 rounded-md ${
                          selectedIndividualBook
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Add Book
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIndividualBook(
                          getELPBooks(selectedGrade)[0],
                        );
                        setTimeout(() => addIndividualBook(), 100);
                      }}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add All Books Individually
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
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {getGradesForBookType(selectedBookType).map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addStandardBook}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add Book
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedBookType} {selectedGrade} -{" "}
                    {formatCurrency(
                      getDefaultPrice(selectedBookType, selectedGrade),
                    )}{" "}
                    per book
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
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{item.bookType}</td>
                          <td className="px-4 py-3 text-sm">
                            {item.isComboPack
                              ? `${item.grade} Combo Pack`
                              : item.bookName ||
                                `${item.bookType} ${item.grade}`}
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
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "unitPrice",
                                  e.target.value,
                                  "order",
                                )
                              }
                              className="w-32 px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatCurrency(item.totalPrice)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(index, "order")}
                              className="text-red-600 hover:text-red-800"
                            >
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
                onClick={() => addKit("Wonder Kit")}
                className="px-6 py-4 bg-purple-100 border border-purple-300 rounded-lg hover:bg-purple-200 text-center"
              >
                <div className="font-medium text-purple-800">Wonder Kit</div>
              </button>

              <button
                type="button"
                onClick={() => addKit("Nexus Kit")}
                className="px-6 py-4 bg-indigo-100 border border-indigo-300 rounded-lg hover:bg-indigo-200 text-center"
              >
                <div className="font-medium text-indigo-800">Nexus Kit</div>
              </button>

              <button
                type="button"
                onClick={addCustomKit}
                className="px-6 py-4 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-center"
              >
                <div className="font-medium text-gray-800">Individual  Kit</div>
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
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{item.kitType}</td>
                          <td className="px-4 py-3">
                            {item.kitType === "Individual Kit" ? (
                              <input
                                type="text"
                                value={item.kitName}
                                onChange={(e) =>
                                  updateKitName(index, e.target.value)
                                }
                                placeholder="Enter kit name"
                                className="w-full px-2 py-1 border border-gray-300 rounded"
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
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "unitPrice",
                                  e.target.value,
                                  "kit",
                                )
                              }
                              className="w-32 px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatCurrency(item.totalPrice)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(index, "kit")}
                              className="text-red-600 hover:text-red-800"
                            >
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4">
                  Shipping Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Books Total:</span>
                      <span className="font-medium">
                        {formatCurrency(orderTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kits Total:</span>
                      <span className="font-medium">
                        {formatCurrency(kitTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">₹</span>
                        <input
                          type="number"
                          min="0"
                          max={subtotal}
                          value={formData.discount}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              discount: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3">
                      <span className="text-lg font-semibold">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading || formData.orderItems.length === 0}
                    className={`w-full py-3 px-4 rounded-md font-medium ${
                      loading || formData.orderItems.length === 0
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {loading ? "Creating Order..." : "Create Order"}
                  </button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {formData.orderItems.length === 0
                      ? "Add at least one book to create order"
                      : "Click to create order and generate invoice"}
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
