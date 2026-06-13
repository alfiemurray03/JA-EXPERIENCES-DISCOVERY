import GenericBuilder from '@/components/GenericBuilder';
import BuilderDocPreview from '@/components/BuilderDocPreview';

export default function InvoiceBuilderPage() {
  return (
    <GenericBuilder
      builderId="invoice"
      title="Invoice Builder"
      subtitle="Standard invoices, VAT invoices, pro forma, credit notes, quotes, receipts"
      metaDescription="Create professional UK invoices including standard invoices, VAT invoices, pro forma invoices, credit notes, quotes, deposit invoices, and payment receipts."
      defaultAccentColor="#b45309"
      renderPreview={(fields, template, branding, layoutId) => (
        <BuilderDocPreview fields={fields} template={template} branding={branding} layoutId={layoutId} docTypeLabel="INVOICE" />
      )}
    />
  );
}
