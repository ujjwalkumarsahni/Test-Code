// frontend/src/pages/InvoicePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { orderAPI } from "../../api/api.js";
import {
  Printer,
  Download,
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const InvoicePage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef();

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Failed to load invoice data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Download PDF
  const downloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${order.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    }
  };

  // Print invoice
  const printInvoice = () => {
    window.print();
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invoice not found
          </h2>
          <a href="/orders" className="text-blue-600 hover:text-blue-800">
            Back to Orders
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0B234A] to-[#1a3a6a] rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <a
                href={`/orders/${id}`}
                className="text-blue-200 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </a>
              <div>
                <h1 className="text-3xl font-bold">Invoice</h1>
                <p className="mt-2 text-blue-200">
                  {order.invoiceNumber} - {order.schoolName}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={printInvoice}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center border border-white/30"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} className="bg-white rounded-lg shadow-lg p-8">
          {/* Invoice Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Aaklan It Solutions Pvt Ltd
                  </h2>
                  <p className="text-gray-600">Educational Technology Solutions</p>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <div className="mt-2">
                <div className="text-lg font-semibold text-blue-600">
                  {order.invoiceNumber}
                </div>
                <div className="text-gray-600">{order.academicYear}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* From Address */}
            <div>
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-md mr-3">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">From</h3>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">Aaklan It Solutions Pvt Ltd</p>
                <p className="text-gray-700 mt-1">{order.fromAddress.address}</p>
                <p className="text-gray-700">
                  {order.fromAddress.city}, {order.fromAddress.state} -{" "}
                  {order.fromAddress.pincode}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {order.fromAddress.mobile}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {order.fromAddress.email}
                  </div>
                </div>
              </div>
            </div>

            {/* To Address */}
            <div>
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-md mr-3">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Bill To</h3>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{order.toAddress.name}</p>
                <p className="text-gray-700 mt-1">{order.schoolName}</p>
                <p className="text-gray-700">{order.toAddress.address}</p>
                <p className="text-gray-700">
                  {order.toAddress.city}, {order.toAddress.state} -{" "}
                  {order.toAddress.pincode}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {order.toAddress.mobile}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {order.toAddress.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-md mr-3">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-medium">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium">{order.academicYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className={`font-medium ${
                    order.paymentStatus === "paid"
                      ? "text-green-600"
                      : order.paymentStatus === "partial"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                    {order.paymentStatus.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dispatch Status</p>
                  <p className={`font-medium ${
                    order.dispatchStatus === "delivered"
                      ? "text-green-600"
                      : order.dispatchStatus === "dispatched"
                      ? "text-blue-600"
                      : order.dispatchStatus === "processing"
                      ? "text-purple-600"
                      : "text-gray-600"
                  }`}>
                    {order.dispatchStatus.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-12">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="py-3 px-4 text-left font-semibold">Description</th>
                  <th className="py-3 px-4 text-center font-semibold">Quantity</th>
                  <th className="py-3 px-4 text-right font-semibold">Unit Price</th>
                  <th className="py-3 px-4 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Books */}
                {order.orderItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        {item.isComboPack
                          ? `${item.grade} Combo Pack`
                          : item.bookName || `${item.bookType} ${item.grade}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.bookType} {item.grade}
                        {item.isComboPack && " - Combo Pack"}
                        {item.isIndividualBook && " - Individual Book"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}

                {/* Kits */}
                {order.kitItems.map((item, index) => (
                  <tr key={`kit-${index}`} className="border-b border-gray-200">
                    <td className="py-3 px-4">
                      <div className="font-medium">{item.kitName}</div>
                      <div className="text-sm text-gray-600">
                        {item.kitType} Kit
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex flex-col md:flex-row justify-between">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Payment due within 15 days of invoice date</li>
                  <li>• Delivery will be made within 7-10 working days</li>
                  <li>• Prices inclusive of all taxes</li>
                  <li>• Goods once sold will not be taken back</li>
                </ul>
              </div>
            </div>
            <div className="md:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(order.subtotal)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(order.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-300 pt-3">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-300">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Amount in Words:</p>
                      <p className="font-medium text-gray-700">
                        {order.totalAmount.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).replace("INR", "Indian Rupees")} Only
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Authorized Signature</p>
                <div className="border-t border-gray-400 pt-8"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">School Stamp & Signature</p>
                <div className="border-t border-gray-400 pt-8"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">For Aaklan It Solutions</p>
                <div className="text-gray-700">
                  <p>Accounts Department</p>
                  <p>GSTIN: _______________</p>
                  <p>PAN: _______________</p>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>
                Thank you for your business! For any queries, contact us at{" "}
                {order.fromAddress.email} or call {order.fromAddress.mobile}
              </p>
              <p className="mt-1">This is a computer-generated invoice</p>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice, #invoice * {
              visibility: visible;
            }
            #invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InvoicePage;