import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'logistics', icon: 'Truck', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

export const shippingManifest = mk('shipping-manifest', 'Shipping Manifest', 'A shipping manifest listing all items in a shipment.', ['shipping', 'manifest', 'logistics'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'shipperName', label: 'Shipper Name', type: 'text', required: true },
    { id: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
    { id: 'shipmentDate', label: 'Shipment Date', type: 'date', required: false },
    { id: 'trackingNumber', label: 'Tracking Number', type: 'text', required: false },
    { id: 'carrier', label: 'Carrier / Courier', type: 'text', required: false },
    { id: 'originAddress', label: 'Origin Address', type: 'textarea', required: false },
    { id: 'destinationAddress', label: 'Destination Address', type: 'textarea', required: false },
    { id: 'items', label: 'Items (Description, Qty, Weight)', type: 'textarea', required: false },
    { id: 'totalWeight', label: 'Total Weight', type: 'text', required: false },
    { id: 'totalValue', label: 'Declared Value', type: 'text', required: false },
    { id: 'specialInstructions', label: 'Special Instructions', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Shipping Manifest', infoTable([['Shipper', or(d.shipperName,'[Shipper]')],['Recipient', or(d.recipientName,'[Recipient]')],['Date', fmtDate(d.shipmentDate)],['Tracking No.', d.trackingNumber],['Carrier', d.carrier],['Total Weight', d.totalWeight],['Declared Value', d.totalValue]])),
    section('Origin', `<p>${nl2br(or(d.originAddress,'[Origin]'))}</p>`),
    section('Destination', `<p>${nl2br(or(d.destinationAddress,'[Destination]'))}</p>`),
    d.items ? section('Items', `<p>${nl2br(d.items)}</p>`) : '',
    d.specialInstructions ? section('Special Instructions', `<p>${nl2br(d.specialInstructions)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const warehouseReceiptNote = mk('warehouse-receipt-note', 'Warehouse Receipt Note', 'A receipt note for goods received at a warehouse.', ['warehouse', 'receipt', 'goods', 'logistics'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'warehouseName', label: 'Warehouse Name', type: 'text', required: true },
    { id: 'supplierName', label: 'Supplier Name', type: 'text', required: true },
    { id: 'receiptDate', label: 'Receipt Date', type: 'date', required: false },
    { id: 'purchaseOrderRef', label: 'Purchase Order Reference', type: 'text', required: false },
    { id: 'items', label: 'Items Received (Description, Qty, Condition)', type: 'textarea', required: false },
    { id: 'receivedBy', label: 'Received By', type: 'text', required: false },
    { id: 'discrepancies', label: 'Discrepancies / Damage', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Warehouse Receipt Note', infoTable([['Warehouse', or(d.warehouseName,'[Warehouse]')],['Supplier', or(d.supplierName,'[Supplier]')],['Date', fmtDate(d.receiptDate)],['PO Reference', d.purchaseOrderRef],['Received By', d.receivedBy]])),
    d.items ? section('Items Received', `<p>${nl2br(d.items)}</p>`) : '',
    d.discrepancies ? section('Discrepancies / Damage', `<p>${nl2br(d.discrepancies)}</p>`) : '',
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const supplierEvaluationForm = mk('supplier-evaluation', 'Supplier Evaluation Form', 'A form to evaluate and score a supplier.', ['supplier', 'evaluation', 'procurement', 'logistics'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Your Organisation', type: 'text', required: true },
    { id: 'supplierName', label: 'Supplier Name', type: 'text', required: true },
    { id: 'evaluationDate', label: 'Evaluation Date', type: 'date', required: false },
    { id: 'evaluator', label: 'Evaluator', type: 'text', required: false },
    { id: 'qualityScore', label: 'Quality Score (1–5)', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Satisfactory', '2 - Poor', '1 - Unacceptable'] },
    { id: 'deliveryScore', label: 'Delivery / Lead Time Score (1–5)', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Satisfactory', '2 - Poor', '1 - Unacceptable'] },
    { id: 'priceScore', label: 'Price / Value Score (1–5)', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Satisfactory', '2 - Poor', '1 - Unacceptable'] },
    { id: 'serviceScore', label: 'Customer Service Score (1–5)', type: 'select', required: false, options: ['5 - Excellent', '4 - Good', '3 - Satisfactory', '2 - Poor', '1 - Unacceptable'] },
    { id: 'comments', label: 'Comments', type: 'textarea', required: false },
    { id: 'recommendation', label: 'Recommendation', type: 'select', required: false, options: ['Approved Supplier', 'Conditional Approval', 'Not Approved'] },
  ]}],
  (d) => [
    section('Supplier Evaluation', infoTable([['Organisation', or(d.orgName,'[Org]')],['Supplier', or(d.supplierName,'[Supplier]')],['Date', fmtDate(d.evaluationDate)],['Evaluator', d.evaluator],['Recommendation', d.recommendation]])),
    section('Scores', infoTable([['Quality', d.qualityScore],['Delivery', d.deliveryScore],['Price / Value', d.priceScore],['Customer Service', d.serviceScore]])),
    d.comments ? section('Comments', `<p>${nl2br(d.comments)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const inventoryCountSheet = mk('inventory-count-sheet', 'Inventory Count Sheet', 'A stock / inventory count sheet for warehouses or stores.', ['inventory', 'stock', 'count', 'warehouse'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Organisation / Location', type: 'text', required: true },
    { id: 'countDate', label: 'Count Date', type: 'date', required: false },
    { id: 'countedBy', label: 'Counted By', type: 'text', required: false },
    { id: 'items', label: 'Items (SKU, Description, Expected Qty, Actual Qty, Variance)', type: 'textarea', required: false },
    { id: 'notes', label: 'Notes / Discrepancies', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Inventory Count Sheet', infoTable([['Organisation', or(d.orgName,'[Org]')],['Date', fmtDate(d.countDate)],['Counted By', d.countedBy]])),
    d.items ? section('Inventory Items', `<p>${nl2br(d.items)}</p>`) : '',
    d.notes ? section('Notes / Discrepancies', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const freightQuoteRequest = mk('freight-quote-request', 'Freight Quote Request', 'A request for a freight or shipping quote.', ['freight', 'quote', 'shipping', 'logistics'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'companyName', label: 'Your Company Name', type: 'text', required: true },
    { id: 'contactName', label: 'Contact Name', type: 'text', required: false },
    { id: 'contactEmail', label: 'Contact Email', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'collectionAddress', label: 'Collection Address', type: 'textarea', required: false },
    { id: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', required: false },
    { id: 'goodsDescription', label: 'Description of Goods', type: 'textarea', required: false },
    { id: 'weight', label: 'Total Weight', type: 'text', required: false },
    { id: 'dimensions', label: 'Dimensions', type: 'text', required: false },
    { id: 'collectionDate', label: 'Required Collection Date', type: 'date', required: false },
    { id: 'deliveryDate', label: 'Required Delivery Date', type: 'date', required: false },
    { id: 'specialRequirements', label: 'Special Requirements', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Freight Quote Request', infoTable([['Company', or(d.companyName,'[Company]')],['Contact', d.contactName],['Email', d.contactEmail],['Date', fmtDate(d.date)],['Weight', d.weight],['Dimensions', d.dimensions],['Collection Date', fmtDate(d.collectionDate)],['Delivery Date', fmtDate(d.deliveryDate)]])),
    section('Collection Address', `<p>${nl2br(or(d.collectionAddress,'[Collection]'))}</p>`),
    section('Delivery Address', `<p>${nl2br(or(d.deliveryAddress,'[Delivery]'))}</p>`),
    d.goodsDescription ? section('Goods Description', `<p>${nl2br(d.goodsDescription)}</p>`) : '',
    d.specialRequirements ? section('Special Requirements', `<p>${nl2br(d.specialRequirements)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const returnsMerchandiseAuthorisation = mk('returns-authorisation', 'Returns Merchandise Authorisation (RMA)', 'An RMA form for product returns.', ['returns', 'rma', 'logistics', 'refund'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'companyName', label: 'Company Name', type: 'text', required: true },
    { id: 'customerName', label: 'Customer Name', type: 'text', required: true },
    { id: 'orderRef', label: 'Order Reference', type: 'text', required: false },
    { id: 'rmaNumber', label: 'RMA Number', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'itemsToReturn', label: 'Items to Return', type: 'textarea', required: false },
    { id: 'reasonForReturn', label: 'Reason for Return', type: 'textarea', required: false },
    { id: 'resolution', label: 'Requested Resolution', type: 'select', required: false, options: ['Refund', 'Replacement', 'Repair', 'Credit Note'] },
    { id: 'returnAddress', label: 'Return Address', type: 'textarea', required: false },
    { id: 'instructions', label: 'Return Instructions', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Returns Authorisation', infoTable([['Company', or(d.companyName,'[Company]')],['Customer', or(d.customerName,'[Customer]')],['Order Ref', d.orderRef],['RMA Number', d.rmaNumber],['Date', fmtDate(d.date)],['Resolution', d.resolution]])),
    d.itemsToReturn ? section('Items to Return', `<p>${nl2br(d.itemsToReturn)}</p>`) : '',
    d.reasonForReturn ? section('Reason for Return', `<p>${nl2br(d.reasonForReturn)}</p>`) : '',
    d.returnAddress ? section('Return Address', `<p>${nl2br(d.returnAddress)}</p>`) : '',
    d.instructions ? section('Return Instructions', `<p>${nl2br(d.instructions)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const ALL_LOGISTICS_TEMPLATES: DocumentTemplate[] = [
  shippingManifest, warehouseReceiptNote, supplierEvaluationForm,
  inventoryCountSheet, freightQuoteRequest, returnsMerchandiseAuthorisation,
];
