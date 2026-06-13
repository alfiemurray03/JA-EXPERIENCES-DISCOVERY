import GenericBuilder from '@/components/GenericBuilder';
import BuilderDocPreview from '@/components/BuilderDocPreview';

export default function LetterBuilderPage() {
  return (
    <GenericBuilder
      builderId="letter"
      title="Letter Builder"
      subtitle="Formal letters, complaints, HR, property, cover letters, legal notices"
      metaDescription="Create professional UK letters including formal business letters, complaint letters, resignation letters, job offers, cover letters, and legal notices."
      defaultAccentColor="#1B4F8A"
      renderPreview={(fields, template, branding, layoutId) => (
        <BuilderDocPreview fields={fields} template={template} branding={branding} layoutId={layoutId} docTypeLabel="LETTER" />
      )}
    />
  );
}
