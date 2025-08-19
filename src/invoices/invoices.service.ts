import { SiteConfigRepository } from './../site-config/site-config.repository';
import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from './invoices.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { InvoiceDto } from 'prisma/src/generated/dto/invoice.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { EventPayloads } from 'src/event-emitter/interface/event-types.interface';
import { ProductsRepository } from 'src/products/products.repository';
import { Readable } from 'stream';
import { FileRepositoryService } from 'src/file-repository/file-repository.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'; // Import der pdf-lib-Bibliothek

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly productRepository: ProductsRepository,
    private readonly fileService: FileRepositoryService,
    private readonly siteConfigRepository: SiteConfigRepository,
  ) {}

  create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDto> {
    return this.invoicesRepository.create(createInvoiceDto);
  }

  findAll(limit = 10, page = 1): Promise<PagingResultDto<InvoiceDto>> {
    return this.invoicesRepository.findAll(limit, page);
  }

  findById(id: string): Promise<InvoiceDto> {
    return this.invoicesRepository.findById(id);
  }

  update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<InvoiceDto> {
    return this.invoicesRepository.update(id, updateInvoiceDto);
  }

  @OnEvent('order.created')
  async orderCreated(data: EventPayloads['order.created']) {
    const { orderId, items } = data;

    // 1) Daten laden
    const products = await this.productRepository.findProductByIds(
      items.map((i) => i.productId),
    );
    const companyInfo = await this.siteConfigRepository.findFirst();

    // Map für Mengen/Preise
    const rows = products.map((p) => {
      const itm = items.find((i) => i.productId === p.productId);
      const quantity = itm?.productAmount ?? 0;
      const price = p.price ?? 0;
      return {
        name: p.name,
        quantity,
        price,
        total: quantity * price,
      };
    });
    const invoiceAmount = rows.reduce((s, r) => s + r.total, 0);

    // 2) PDF erzeugen (A4)
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.276, 841.89]); // A4 in pt
    let { width, height } = page.getSize();

    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const drawText = (
      text: string,
      x: number,
      y: number,
      font = regularFont,
      size = 12,
      color = rgb(0, 0, 0),
    ) => {
      page.drawText(String(text ?? ''), { x, y, font, size, color });
    };

    // Optional: Logo aus Storage einbetten (PNG/JPG)
    // if (companyInfo?.logoPath) {
    //   const logoBytes = await this.fileService.getFileBytes(companyInfo.logoPath); // Implementiere diese Methode
    //   const isPng = companyInfo.logoPath.toLowerCase().endsWith('.png');
    //   const logoImage = isPng ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
    //   const logoDims = logoImage.scale(0.5);
    //   const logoX = width - 50 - logoDims.width;
    //   const logoY = height - 50 - logoDims.height;
    //   page.drawImage(logoImage, { x: logoX, y: logoY, width: logoDims.width, height: logoDims.height });
    // }

    // Header
    drawText('RECHNUNG', 50, height - 50, boldFont, 24);
    drawText(`Bestellnummer: ${orderId}`, 50, height - 80);
    drawText(`Datum: ${this.formatDateTime(new Date())}`, 50, height - 100);

    drawText(`${companyInfo?.companyName ?? ''}`, 50, height - 130, boldFont);
    drawText(`${companyInfo?.address?.streetName ?? ''}`, 50, height - 150);
    drawText(
      `${companyInfo?.address?.postCode ?? ''} ${companyInfo?.address?.city ?? ''} ${companyInfo?.address?.country ?? ''}`,
      50,
      height - 170,
    );
    drawText(`${companyInfo?.phoneNumber ?? ''}`, 50, height - 190);

    // Tabelle
    const tableLeft = 50;
    const colWidths = [250, 100, 100, 95]; // Produkt, Menge, Preis, Gesamt
    let tableTop = height - 220;

    page.drawRectangle({
      x: tableLeft,
      y: tableTop - 20,
      width: width - 100,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
    });

    drawText('Produkt', tableLeft + 5, tableTop - 15, boldFont);
    drawText('Menge', tableLeft + colWidths[0] + 5, tableTop - 15, boldFont);
    drawText(
      'Preis',
      tableLeft + colWidths[0] + colWidths[1] + 5,
      tableTop - 15,
      boldFont,
    );
    drawText(
      'Gesamt',
      tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5,
      tableTop - 15,
      boldFont,
    );

    let y = tableTop - 40;
    const rowHeight = 18;

    const drawHeaderOnNewPage = () => {
      page.drawRectangle({
        x: tableLeft,
        y: height - 50 - 20,
        width: width - 100,
        height: 20,
        color: rgb(0.9, 0.9, 0.9),
      });
      drawText('Produkt', tableLeft + 5, height - 50 - 15, boldFont);
      drawText(
        'Menge',
        tableLeft + colWidths[0] + 5,
        height - 50 - 15,
        boldFont,
      );
      drawText(
        'Preis',
        tableLeft + colWidths[0] + colWidths[1] + 5,
        height - 50 - 15,
        boldFont,
      );
      drawText(
        'Gesamt',
        tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5,
        height - 50 - 15,
        boldFont,
      );
    };

    const ensureSpace = () => {
      if (y < 100) {
        page = pdfDoc.addPage([595.276, 841.89]);
        ({ width, height } = page.getSize());
        drawHeaderOnNewPage();
        y = height - 50 - 40;
      }
    };

    for (const r of rows) {
      drawText(r.name, tableLeft + 5, y);
      drawText(String(r.quantity), tableLeft + colWidths[0] + 5, y);
      drawText(
        this.formatPrice(r.price),
        tableLeft + colWidths[0] + colWidths[1] + 5,
        y,
      );
      drawText(
        this.formatPrice(r.total),
        tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5,
        y,
      );
      y -= rowHeight;
      ensureSpace();
    }

    // Summe
    y -= 10;
    page.drawLine({
      start: { x: tableLeft, y: y + 12 },
      end: { x: width - 50, y: y + 12 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    drawText(
      'Gesamtbetrag:',
      tableLeft + colWidths[0] + colWidths[1] + 5,
      y,
      boldFont,
    );
    drawText(
      this.formatPrice(invoiceAmount),
      tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 5,
      y,
      boldFont,
    );

    // Footer
    const footerY = 50;
    drawText('Danke für Ihr Vertrauen', 50, footerY, regularFont, 10);
    drawText(
      `Rechnung erstellt am: ${this.formatDateTime(new Date())}`,
      50,
      footerY - 15,
      regularFont,
      10,
    );

    // Seitenzahlen
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i);
      p.drawText(`Seite ${i + 1} von ${totalPages}`, {
        x: width - 120,
        y: 15,
        size: 10,
        font: regularFont,
      });
    }

    // 3) Speichern & hochladen
    const pdfBytes = await pdfDoc.save(); // Uint8Array
    const pdfBuffer = Buffer.from(pdfBytes); // -> Buffer für Upload
    const stream = Readable.from(pdfBuffer);

    const file: Express.Multer.File = {
      fieldname: 'invoice',
      originalname: `${orderId}.pdf`,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
      buffer: pdfBuffer,
      destination: '',
      filename: '',
      path: '',
      stream,
    };

    const filename = await this.fileService.uploadFile(file);

    await this.invoicesRepository.create({
      orderId,
      invoiceAmount,
      pdfUrl: filename,
    });
  }

  private formatPrice(n: number) {
    return new Intl.NumberFormat('de-AT', {
      style: 'currency',
      currency: 'EUR',
    }).format((n ?? 0) / 100);
  }
  private formatDateTime(d: Date) {
    return d.toLocaleString('de-AT', { hour12: false });
  }
}
