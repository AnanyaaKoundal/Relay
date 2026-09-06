import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3, { S3_BUCKET } from "../../lib/s3.js";

interface InvoiceInput {
  paymentId: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  billingCountry: string;
  gatewayTransactionId: string;
  gateway: string;
  createdAt: Date;
  couponCode: string | null;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "Rs.",
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
};

function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${symbol}${amount.toFixed(2)}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function drawLine(doc: PDFDocument, y: number, width: number) {
  const page = doc.getPage(0);
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
}

export async function generateInvoice(input: InvoiceInput): Promise<string> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([612, 792]); // US Letter
  const pageWidth = 612;
  let y = 742;

  // ── Header: Relay ──
  page.drawText("RELAY", {
    x: 50,
    y,
    size: 28,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 8;
  page.drawText("Learning Platform", {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // ── INVOICE title ──
  y -= 40;
  page.drawText("INVOICE", {
    x: 50,
    y,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // ── Invoice meta (right side) ──
  const shortId = input.paymentId.slice(0, 8).toUpperCase();
  const invoiceNo = `INV-${shortId}`;
  const metaX = pageWidth - 50;

  y += 2;
  page.drawText(`Invoice No: ${invoiceNo}`, {
    x: metaX - helvetica.widthOfTextAtSize(`Invoice No: ${invoiceNo}`, 10),
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 16;
  page.drawText(`Date: ${formatDate(input.createdAt)}`, {
    x: metaX - helvetica.widthOfTextAtSize(`Date: ${formatDate(input.createdAt)}`, 10),
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 16;
  page.drawText(`Transaction: ${input.gatewayTransactionId}`, {
    x: metaX - helvetica.widthOfTextAtSize(`Transaction: ${input.gatewayTransactionId}`, 10),
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // ── Bill To ──
  y -= 40;
  page.drawText("BILL TO", {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 16;
  page.drawText(input.userName, {
    x: 50,
    y,
    size: 11,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 15;
  page.drawText(input.userEmail, {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // ── Line separator ──
  y -= 24;
  drawLine(doc, y, pageWidth);

  // ── Table header ──
  y -= 20;
  page.drawText("DESCRIPTION", {
    x: 50,
    y,
    size: 9,
    font: helveticaBold,
    color: rgb(0.5, 0.5, 0.5),
  });
  page.drawText("AMOUNT", {
    x: metaX - helveticaBold.widthOfTextAtSize("AMOUNT", 9),
    y,
    size: 9,
    font: helveticaBold,
    color: rgb(0.5, 0.5, 0.5),
  });

  // ── Course line ──
  y -= 24;
  const courseLabel = `Course: ${input.courseTitle}`;
  // Truncate if too long
  const maxCourseWidth = 300;
  let displayCourse = courseLabel;
  while (helvetica.widthOfTextAtSize(displayCourse, 11) > maxCourseWidth && displayCourse.length > 10) {
    displayCourse = displayCourse.slice(0, -4) + "...";
  }
  page.drawText(displayCourse, {
    x: 50,
    y,
    size: 11,
    font: helvetica,
    color: rgb(0.1, 0.1, 0.1),
  });

  // ── Subtotal ──
  y -= 28;
  page.drawText("Subtotal", {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(formatCurrency(input.subtotal, input.currency), {
    x: metaX - helvetica.widthOfTextAtSize(formatCurrency(input.subtotal, input.currency), 10),
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.1, 0.1, 0.1),
  });

  // ── Discount (if any) ──
  if (input.discountAmount > 0) {
    y -= 20;
    const discountLabel = input.couponCode
      ? `Discount (${input.couponCode})`
      : "Discount";
    page.drawText(discountLabel, {
      x: 50,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.2, 0.6, 0.3),
    });
    const discountText = `-${formatCurrency(input.discountAmount, input.currency)}`;
    page.drawText(discountText, {
      x: metaX - helvetica.widthOfTextAtSize(discountText, 10),
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.2, 0.6, 0.3),
    });
  }

  // ── Tax ──
  y -= 20;
  const taxLabel = `Tax (${input.billingCountry}%)`;
  page.drawText(taxLabel, {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(formatCurrency(input.taxAmount, input.currency), {
    x: metaX - helvetica.widthOfTextAtSize(formatCurrency(input.taxAmount, input.currency), 10),
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.1, 0.1, 0.1),
  });

  // ── Total ──
  y -= 30;
  drawLine(doc, y + 8, pageWidth);
  page.drawText("Total", {
    x: 50,
    y,
    size: 13,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText(formatCurrency(input.totalAmount, input.currency), {
    x: metaX - helveticaBold.widthOfTextAtSize(formatCurrency(input.totalAmount, input.currency), 13),
    y,
    size: 13,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // ── Payment info ──
  y -= 40;
  drawLine(doc, y + 12, pageWidth);
  const GATEWAY_LABELS: Record<string, string> = {
    MOCK: "Test Gateway",
    STRIPE: "Card",
    RAZORPAY: "Card",
  };
  page.drawText(`Payment Method: ${GATEWAY_LABELS[input.gateway] ?? input.gateway}`, {
    x: 50,
    y,
    size: 9,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // ── Footer ──
  y -= 60;
  drawLine(doc, y + 12, pageWidth);
  page.drawText("Relay Learning Platform", {
    x: 50,
    y,
    size: 9,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await doc.save();

  // Upload to S3
  const key = `invoices/${input.paymentId}.pdf`;
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: pdfBytes,
      ContentType: "application/pdf",
    })
  );

  return `/s3/${key}`;
}
