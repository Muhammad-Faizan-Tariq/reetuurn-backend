import PDFDocument from "pdfkit";

export const generateReceiptPDF = (res, receipt) => {
  const doc = new PDFDocument();

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${receipt._id}.pdf`
  );
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  doc.fontSize(20).text("Return Receipt", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Receipt ID: ${receipt._id}`);
  doc.text(`Order ID: ${receipt.returnOrderId?._id || "N/A"}`);
  doc.text(`Status: ${receipt.returnOrderId?.status || "N/A"}`);
  doc.text(`Generated At: ${receipt.generatedAt || receipt.createdAt}`);

  if (receipt.returnOrderId?.totalAmount != null) {
    doc.text(`Total Amount: ${receipt.returnOrderId.totalAmount}`);
  }
  if (receipt.returnOrderId?.currency) {
    doc.text(`Currency: ${receipt.returnOrderId.currency}`);
  }

  if (Array.isArray(receipt.returnOrderId?.packages)) {
    doc.moveDown().text("Packages:");
    receipt.returnOrderId.packages.forEach((p, i) => {
      const label = p?.label || p?.name || `Package ${i + 1}`;
      doc.text(`• ${label}`);
    });
  }

  doc.end();
};
