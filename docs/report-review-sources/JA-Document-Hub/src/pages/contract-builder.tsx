import GenericBuilder from '@/components/GenericBuilder';
import BuilderDocPreview from '@/components/BuilderDocPreview';

export default function ContractBuilderPage() {
  return (
    <GenericBuilder
      builderId="contract"
      title="Contract Builder"
      subtitle="Service agreements, NDAs, contractor agreements, partnerships"
      metaDescription="Create professional UK contracts and agreements including service agreements, NDAs, contractor agreements, and partnership agreements."
      defaultAccentColor="#dc2626"
      renderPreview={(fields, template, branding, layoutId) => (
        <BuilderDocPreview fields={fields} template={template} branding={branding} layoutId={layoutId} docTypeLabel="CONTRACT / AGREEMENT" />
      )}
    />
  );
}
