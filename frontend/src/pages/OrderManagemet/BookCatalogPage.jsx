import React from "react";
import { downloadPayslip } from "../../GenerateSaleray.js";

const BookCatalogPage = () => {
  const dummySalary =  {
    payPeriod: "Jan 2026",
    employee: {
      basicInfo: {
        employeeId: "EMP001",
        fullName: "Ujjwal Kumar",
        designation: "Full Stack Developer",
        department: "Development",
        dateOfJoining: "2024-06-15",
      },
    },
    earnings: {
      basicSalary: 30000,
      hraAllowance: 8000,
      travelAllowance: 2000,
      otherAllowance: 1500,
      foodAllowance: 1000,
      addClassAllowance: 500,
      pf: 1800,
      esic: 500,
    },
    deductions: {
      leavesAmount: 1000,
      absentAmount: 500,
      hraAllowance: 1000,
      travelAllowance: 300,
      otherAllowance: 900,
      foodAllowance: 200,
      addClassAllowance: 200,
      pf: 1800,
      esic: 500,
    },
    paymentDetails: {
      paymentDate: "2026-01-31",
      transactionId: "TXN123456",
      bankName: "HDFC Bank",
    },
    status: "Paid",
  }

  return (
    <button
      onClick={() => downloadPayslip(dummySalary)}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Download Salary
    </button>
  );
};

export default BookCatalogPage;
