import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadPayslip = (salary) => {

  const doc = new jsPDF("p","mm","a4");

  // ================= HEADER =================
  const logo =
  "https://res.cloudinary.com/domel2a7e/image/upload/v1763188956/profiles/logos/cfovzklhgelaxqziccal.png";

  doc.addImage(logo,"PNG",10,4,40,15);

  doc.setFont("helvetica","bold");
  doc.setFontSize(12);
  doc.text("Aaklan IT Solutions Pvt. Ltd.",200,10,{align:"right"});

  doc.setFont("helvetica","normal");
  doc.setFontSize(9);
  doc.text("IT-9(A), EPIP, IT Park Road, Sitapura",200,15,{align:"right"});
  doc.text("Jaipur, Rajasthan - 302022",200,19,{align:"right"});

  // Orange + Blue strip
  doc.setFillColor(244,163,0);
  doc.rect(0,21,210,4,"F");

  doc.setFillColor(31,42,68);
  doc.rect(170,21,40,4,"F");

  // ================= TITLE =================
  doc.setFont("helvetica","bold");
  doc.setFontSize(16);
  doc.text("SALARY PAYSLIP",105,35,{align:"center"});

  doc.setFont("helvetica","normal");

  // ================= EMPLOYEE INFO =================
  const emp = salary.employee.basicInfo;

  const safeDate = d =>
    d ? new Date(d).toLocaleDateString("en-IN") : "-";

  doc.setFontSize(12);

  doc.text(`Date of Joining : ${safeDate(emp.dateOfJoining)}`,10,50);
  doc.text(`Pay Period : ${salary.payPeriod}`,10,56);
  doc.text(`Worked Days : 26`,10,62);

  doc.text(`Employee Name : ${emp.fullName}`,110,50);
  doc.text(`Designation : ${emp.designation}`,110,56);
  doc.text(`Department : ${emp.department}`,110,62);

  // ================= DATA =================
  const e = salary.earnings;
  const d = salary.deductions;

  const earningsRows = [
    ["Basic Salary",e.basicSalary],
    ["HRA Allowance",e.hraAllowance],
    ["Travel Allowance",e.travelAllowance],
    ["Other Allowance",e.otherAllowance],
    ["Food Allowance",e.foodAllowance],
    ["Add Class Allowance",e.addClassAllowance],
    ["PF Contribution",e.pf],
    ["ESIC Contribution",e.esic],
  ];

  const totalEarnings =
    earningsRows.reduce((s,r)=>s+r[1],0);

  earningsRows.push(["Total Earnings",totalEarnings]);

  const deductionRows = [
    ["Leave Deductions",d.leavesAmount+d.absentAmount],
    ["HRA Deduction",d.hraAllowance],
    ["Travel Deduction",d.travelAllowance],
    ["Other Deduction",d.otherAllowance],
    ["Food Deduction",d.foodAllowance],
    ["Add Class Deduction",d.addClassAllowance],
    ["PF Deduction",d.pf],
    ["ESIC Deduction",d.esic],
  ];

  const totalDed =
    deductionRows.reduce((s,r)=>s+r[1],0);

  const net = totalEarnings-totalDed;

  deductionRows.push(["Total Deductions",totalDed]);
  deductionRows.push(["Net Pay",net]);

  // ================= TABLES =================
  const tableStartY = 70;

  autoTable(doc,{
  startY:tableStartY,
  margin:{ left:10 },
  tableWidth:90,

  styles:{ fontSize:10, cellPadding:1.5 },

  head:[["Earnings","Amount"]],
  body:earningsRows.map(r=>[r[0],`Rs.${Math.round(r[1])}`]),

  columnStyles:{
    0:{cellWidth:55},
    1:{cellWidth:35,halign:"right"}
  },

  headStyles:{
    fillColor:[31,42,68],
    textColor:255,
    fontStyle:"bold"
  },

  didParseCell: data=>{
    // Last row = Total Earnings
    if(data.row.index === earningsRows.length-1){

      // Bold for BOTH columns
      data.cell.styles.fontStyle="bold";
      data.cell.styles.fontSize=11;

      // Color ONLY value column
      if(data.column.index === 1){
        data.cell.styles.textColor=[31,42,68];
      }

    }
  }
});


  autoTable(doc,{
  startY:tableStartY,
  margin:{ left:110 },
  tableWidth:90,

  styles:{ fontSize:10, cellPadding:1.5 },

  head:[["Deductions","Amount"]],
  body:deductionRows.map(r=>[r[0],`Rs.${Math.round(r[1])}`]),

  columnStyles:{
    0:{cellWidth:55},
    1:{cellWidth:35, halign:"right"}
  },

  headStyles:{
    fillColor:[31,42,68],
    textColor:255,
    fontStyle:"bold"
  },

  didParseCell:data=>{
    if(data.row.index >= deductionRows.length-2){

      // BOTH columns bold
      data.cell.styles.fontStyle="bold";
      data.cell.styles.fontSize=11;

      // ONLY value column colored
      if(data.column.index === 1){
        data.cell.styles.textColor=[31,42,68];
      }

    }
  }
});


  // ================= PAYMENT DETAILS =================
  const pay = salary.paymentDetails;

  autoTable(doc,{
    startY: doc.lastAutoTable.finalY+5,
    margin:{ left:10, right:10 },
    tableWidth:190,
    styles:{ fontSize:10, cellPadding:1.5 },
    head:[["PAYMENT DETAILS",""]],
    body:[
      ["Payment Date", safeDate(pay.paymentDate)],
      ["Transaction ID", pay.transactionId],
      ["Bank Name", pay.bankName],
      ["Payment Method", "Bank Transfer"],
      ["Status", salary.status]
    ],
    headStyles:{fillColor:[31,42,68],textColor:255},
  });

  // ================= NUMBER TO WORDS =================
  const numberToWords = (num) => {
    const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
    "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const b=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

    if(num<20) return a[num];
    if(num<100) return b[Math.floor(num/10)]+" "+a[num%10];
    if(num<1000) return a[Math.floor(num/100)]+" Hundred "+numberToWords(num%100);
    if(num<100000) return numberToWords(Math.floor(num/1000))+" Thousand "+numberToWords(num%1000);
    return num;
  };

  const wordsY = doc.lastAutoTable.finalY+25;

  doc.setFont("helvetica","bold");
  doc.setFontSize(12);
  doc.text(`Net Pay: Rs.${Math.round(net)}`,105,wordsY,{align:"center"});

  doc.setFont("helvetica","normal");
  doc.text(
    `${numberToWords(Math.round(net))} Only`,
    105,
    wordsY+6,
    {align:"center"}
  );

  // ================= SIGNATURES (FIXED ABOVE FOOTER) =================
// ================= SIGNATURES =================
const h = doc.internal.pageSize.height;

// Stamp Image
const stampImg = "/stamp.png"; // path change if needed

doc.addImage(
  stampImg,
  "png",
  20,        // X position
  h - 65,    // Y position (footer ke upar)
  40,        // width
  40         // height
);

// Employee signature line
doc.setDrawColor(0);
doc.line(140, h-30, 200, h-30);

doc.setFont("helvetica","bold");
doc.text("Employee Signature",140,h-25);


  // ================= FOOTER =================
  doc.setFillColor(244,163,0);
  doc.rect(0,h-18,210,6,"F");

  doc.setFillColor(31,42,68);
  doc.rect(0,h-12,210,12,"F");

  doc.setTextColor(255,255,255);
  doc.setFontSize(8);

  doc.text("CIN: U72900RJ2021PTC072389",10,h-6);
  doc.text("PAN: AAUCA6196N",200,h-6,{align:"right"});

  doc.text(
    "+91 9571677609 | www.aaklan.com | support@aaklan.com",
    105,h-2,{align:"center"}
  );

  // ================= SAVE =================
  doc.save(`Payslip_${emp.fullName}_${salary.payPeriod}.pdf`);
};
