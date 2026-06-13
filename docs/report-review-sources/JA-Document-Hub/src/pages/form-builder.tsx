import GenericBuilder from '@/components/GenericBuilder';
import BuilderDocPreview from '@/components/BuilderDocPreview';

export default function FormBuilderPage() {
  return (
    <GenericBuilder
      builderId="form"
      title="Form Builder"
      subtitle="Booking, consent, feedback, incident, registration, application forms"
      metaDescription="Create professional forms including booking forms, consent forms, feedback forms, incident reports, registration forms, and application forms."
      defaultAccentColor="#0891b2"
      renderPreview={(fields, template, branding, layoutId) => (
        <BuilderDocPreview fields={fields} template={template} branding={branding} layoutId={layoutId} />
      )}
    />
  );
}
