import { useTranslation } from "react-i18next";
import { TicketBus } from "../../icons";
import "/public/assets/css/style.min.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useEffect, useRef, useState } from "react";
import * as bwipjs from "bwip-js";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";

export const BusTicket = ({ bookingDetails, onClose }) => {
  const { t } = useTranslation();
  const ticketRef = useRef(null);
  const [leftBarcodeUrl, setLeftBarcodeUrl] = useState("");
  const [rightBarcodeUrl, setRightBarcodeUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // New state for loading

  
  // Generate barcode data URL
  const generateBarcode = (text) => {
    try {
      const canvas = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid: 'code128',       // Barcode type
        text: text,            // Text to encode
        scale: 2,              // 2x scaling factor
        height: 20,            // Bar height, in millimeters
        includetext: true,     // Show human-readable text
        textxalign: 'center',  // Always good to set
      });
      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('Barcode generation error:', e);
      return '/images/sample-barcode.png'; // Fallback image
    }
  };

  useEffect(() => {
    // Generate barcodes when component mounts
    if (bookingDetails) {
      const bookingId = bookingDetails.id || '123456789';
      const leftBarcodeText = `BUS-${bookingId}-L`;
      const rightBarcodeText = `BUS-${bookingId}-R`;
      
      setLeftBarcodeUrl(generateBarcode(leftBarcodeText));
      setRightBarcodeUrl(generateBarcode(rightBarcodeText));
    }
  }, [bookingDetails]);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    try {
      setIsProcessing(true)
      // Hide buttons before capturing
      const buttons = ticketRef.current.querySelectorAll('button');
      buttons.forEach(btn => btn.style.display = 'none');
      
      
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff' // Ensure white background
      });
      
      // Show buttons again
      buttons.forEach(btn => btn.style.display = '');
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait', // Changed to portrait for A4
        unit: 'mm',
      });
  
      // A4 dimensions (210mm x 297mm)
      const a4Width = 210;
      const a4Height = 297;
      
      // Calculate dimensions to fit content
      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      
      // Calculate dimensions to fit width with some margin
      const margin = 10; // 10mm margin on each side
      const contentWidth = a4Width - (2 * margin);
      const contentHeight = contentWidth / imgRatio;
      
      // Center vertically if content is shorter than page
      const yPos = (a4Height - contentHeight) / 2;
      
      pdf.addImage(
        imgData, 
        'PNG', 
        margin, 
        Math.max(margin, yPos), // Ensure at least 10mm from top
        contentWidth, 
        contentHeight
      );
      
      pdf.save(`bus-ticket-${bookingDetails?.id || 'ticket'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }finally{
      setIsProcessing(false)
    }
  };

  const handlePrint = async () => {
    if (!ticketRef.current) return;
    
    try {
      setIsProcessing(true)
      // Hide buttons before capturing (same as download)
      const buttons = ticketRef.current.querySelectorAll('button');
      buttons.forEach(btn => btn.style.display = 'none');
      
      // Create canvas (same as download)
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Show buttons again
      buttons.forEach(btn => btn.style.display = '');
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF (same as download)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
      });
  
      // A4 dimensions and positioning (same as download)
      const a4Width = 210;
      const a4Height = 297;
      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      const margin = 10;
      const contentWidth = a4Width - (2 * margin);
      const contentHeight = contentWidth / imgRatio;
      const yPos = (a4Height - contentHeight) / 2;
  
      pdf.addImage(
        imgData, 
        'PNG', 
        margin, 
        Math.max(margin, yPos),
        contentWidth, 
        contentHeight
      );
  
      // Instead of saving, open the PDF in a new window for printing
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const printWindow = window.open(pdfUrl);
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          // Optional: revoke object URL after printing
          URL.revokeObjectURL(pdfUrl);
        }, 500);
      };
      
    } catch (error) {
      console.error('Error generating print:', error);
    }finally{
      setIsProcessing(false)
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4 md:p-10">
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
          <span className="ml-3 text-white text-lg">{t("common.processing")}...</span>
        </div>
      )}
      {/* Ticket */}
      <div 
        ref={ticketRef}
        className="relative z-10 w-full min-w-[300px] md:min-w-[750px] bg-white shadow-2xl rounded-md overflow-hidden border-2 border-dashed border-gray-500"
        style={{
          border: '2px dashed #6b7280', // Gray dashed border
          borderImage: 'repeating-linear-gradient(45deg, #6b7280, #6b7280 5px, transparent 5px, transparent 10px) 10', // Fancy dashed effect
        }}
      >
        
        {/* Watermark Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <h1 className="text-4xl md:text-[100px] font-extrabold text-gray-700 opacity-10 select-none text-center leading-none">
            MILLIEKIT
          </h1>
        </div>

        {/* Header */}
        <div className="hidden md:flex bg-purple-800 text-white text-xs md:text-sm font-bold">
          <div className="flex-1 text-right py-2 md:py-3 px-2 md:px-4 border-r border-dashed border-white">
            <div className="flex items-center justify-end gap-1">{t('booking.vendor/agent/busOperator')}</div>
          </div>
          <div className="w-px bg-gradient-to-b from-gray-400 via-transparent to-gray-400 bg-[length:2px_6px] bg-repeat-y"></div>
          <div className="flex-[2] text-right py-2 md:py-3 px-2 md:px-4">
            <div className="flex items-center justify-end gap-1">{t('booking.customer')}</div>
          </div>
        </div>


        {/* Body */}
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Vendor/Agent/Bus Operator */}
          <div className="flex-1 px-2 md:px-4 py-2 md:py-3 ">
            {/* Mobile Header */}
            <div className="md:hidden sm:flex bg-purple-800 text-white text-xs md:text-sm font-bold rounded-md">
              <div className="flex-1 text-center py-2 md:py-3 px-2 md:px-4 border-r border-dashed border-white">
                <div className="flex items-center justify-center gap-1">{t('booking.vendor/agent/busOperator')}</div>
              </div>
              <div className="w-px bg-gradient-to-b from-gray-400 via-transparent to-gray-400 bg-[length:2px_6px] bg-repeat-y"></div>
            </div>
          
            <div className="bg-gray-200 flex justify-between items-center mb-2 md:mb-3  px-2 md:px-4 py-1 md:py-2 rounded-t">
              <div className="text-[10px] md:text-[12px] font-bold">
                {bookingDetails?.trip?.route?.origin_city.name}
              </div>
              <TicketBus className="h-6 w-6 md:h-10 md:w-10" />
              <div className="text-[10px] md:text-[12px] font-bold">
                {bookingDetails?.trip?.route?.destination_city.name}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-1 text-xs md:text-sm m-1 md:m-2">
              <div className="text-gray-500">{t("booking.bus")}</div>
              <div className="font-bold">Sklx 134</div>

              <div className="text-gray-500">{t('booking.traveler')}</div>
              <div className="font-bold">{bookingDetails?.user?.first_name}</div>

              <div className="text-gray-500">{t("booking.totalAmount")}</div>
              <div className="font-bold">{bookingDetails?.total_price}</div>

              <div className="text-gray-500">{t("booking.remainingAmount")}</div>
              <div className="font-bold">{bookingDetails?.remaining_amount}</div>

              <div className="text-gray-500">{t("booking.seatNumber")}</div>
              {bookingDetails?.tickets && (
                <div className="font-bold">
                  {bookingDetails.tickets.map(ticket => ticket.seat_number).join(', ')}
                </div>
              )}
            </div>
            <div className="block sm:hidden w-full mt-4">
              <img 
                src={leftBarcodeUrl || "/images/sample-barcode.png"} 
                alt="barcode" 
                className="w-full h-8" 
              />
            </div>
          </div>

          {/* Dashed Divider - Mobile */}
          <div className="md:hidden w-full h-px bg-gradient-to-r from-gray-400 via-transparent to-gray-400 bg-[length:6px_2px] bg-repeat-x my-1"></div>
          
          {/* Dashed Divider - Desktop */}
          <div className="hidden md:block w-px bg-gradient-to-b from-gray-400 via-transparent to-gray-400 bg-[length:2px_6px] bg-repeat-y"></div>

          {/* Right Side - Customer */}
          <div className="flex-[2] px-2 md:px-4 py-2 md:py-3">
            {/* Mobile Header */}
            <div className="md:hidden flex bg-purple-800 text-white text-xs md:text-sm font-bold rounded-md">
              <div className="w-px bg-gradient-to-b from-gray-400 via-transparent to-gray-400 bg-[length:2px_6px] bg-repeat-y"></div>
              <div className="flex-[2] text-center py-2 md:py-3 px-1 md:px-4">
                <div className="flex items-center justify-center gap-1">{t('booking.customer')}</div>
              </div>
            </div>

            <div className="bg-gray-200 flex justify-between items-center mb-2 md:mb-3 px-2 md:px-4 py-1 md:py-2 rounded-t">
              <div className="text-sm md:text-lg font-bold text-center">
                {bookingDetails?.trip?.route?.origin_city.name}
                <div className="text-2xs md:text-xs text-gray-500">
                  ({bookingDetails?.trip?.route?.origin_station.name})
                </div>
              </div>
              <TicketBus className="h-6 w-6 md:h-10 md:w-10" />
              <div className="text-sm md:text-lg font-bold text-center">
                {bookingDetails?.trip?.route?.destination_city.name}
                <div className="text-2xs md:text-xs text-gray-500">
                  ({bookingDetails?.trip?.route?.destination_station.name})
                </div>
              </div>
            </div>

            {/* Two-column layout section */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:text-sm">
              <div className="text-gray-500">{t("booking.operator")}</div>
              <div className="font-bold">Cooperative 23</div>

              <div className="col-span-2 border border-gray-200 rounded-lg overflow-x-auto mt-1 mb-2">
              <Table className="m-0 p-0">
                {/* Table Header */}
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y m-0 p-0">
                  <TableRow className="m-0 p-0">
                    <TableCell isHeader className="py-1 px-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {t('PASSENGER')}
                    </TableCell>
                    <TableCell isHeader className="py-1 px-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {t('booking.seatNumber')}
                    </TableCell>
                    <TableCell isHeader className="py-1 px-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {t('TICKET_PRICE')}
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800 m-0 p-0">
                  {bookingDetails.tickets.map((ticket, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900 m-0 p-0' : 'bg-gray-50 dark:bg-gray-800 m-0 p-0'}>
                      <TableCell className="py-2 px-2">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {ticket.passenger.first_name}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 text-gray-500 text-theme-sm dark:text-gray-400">
                        {ticket.seat_number}
                      </TableCell>
                      <TableCell className="py-1 px-2 text-gray-500 text-theme-sm dark:text-gray-400">
                        {ticket.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {/* Two-column information grid */}
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bus number</span>
                  <span className="font-bold">Sklx 134</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Traveler</span>
                  <span className="font-bold">Reza Pahlavi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("booking.totalAmount")}</span>
                  <span className="font-bold">{bookingDetails?.total_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("booking.remainingAmount")}</span>
                  <span className="font-bold">{bookingDetails?.remaining_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("BOOKING_TIME")}</span>
                  <span className="font-bold">17:30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("DEPARTURE_TIME")}</span>
                  <span className="font-bold">17:30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("ARRIVAL_TIME")}</span>
                  <span className="font-bold">17:30</span>
                </div>
              </div>
            </div>

            <div className="block sm:hidden w-full mt-4">
              <img 
                src={rightBarcodeUrl || "/images/sample-barcode.png"} 
                alt="barcode" 
                className="w-full h-8" 
              />
            </div>
          </div>
        </div>

        {/* Footer Barcodes - Desktop */}
        <div className="hidden sm:flex h-12 md:h-20 bg-gray-200">
          <div className="flex-1 m-2 md:m-4 flex justify-end items-center">
            <img 
              src={leftBarcodeUrl || "/images/sample-barcode.png"} 
              alt="barcode-left" 
              className="w-16 md:w-24 h-auto" 
            />
          </div>
          <div className="w-px bg-gradient-to-b from-gray-400 via-transparent to-gray-400 bg-[length:2px_6px] bg-repeat-y"></div>
          <div className="flex-[2] m-2 md:m-4 flex justify-end items-center">
            <img 
              src={rightBarcodeUrl || "/images/sample-barcode.png"} 
              alt="barcode-right" 
              className="w-20 md:w-32 h-auto" 
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      {/* Buttons */}
      {/* Buttons */}
      <div className="mt-4 md:mt-6 z-10 flex gap-2 md:gap-4">
        <button
          onClick={onClose}
          className="bg-red-600 text-white px-4 py-1 md:px-6 md:py-2 rounded hover:bg-red-700 transition text-xs md:text-sm"
        >
          {t('CLOSE')}
        </button>
        <button
          onClick={handleDownload}
          className={`bg-blue-600 text-white px-4 py-1 md:px-6 md:py-2 rounded hover:bg-blue-700 transition text-xs md:text-sm ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? t('common.processing') : t('common.download')}
        </button>
        <button
          onClick={handlePrint}
          className={`bg-green-600 text-white px-4 py-1 md:px-6 md:py-2 rounded hover:bg-green-700 transition text-xs md:text-sm ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
          {isProcessing ? t('common.processing') : t('common.print')}
        </button>
      </div>
    </div>
  );
};