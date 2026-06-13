import GenericBuilder from '@/components/GenericBuilder';
import BuilderDocPreview from '@/components/BuilderDocPreview';

export default function ChecklistBuilderPage() {
  return (
    <GenericBuilder
      builderId="checklist"
      title="Checklist Builder"
      subtitle="Onboarding, compliance, property inspection, H&S, event, due diligence"
      metaDescription="Create professional checklists including onboarding checklists, compliance checklists, property inspection checklists, and health & safety checklists."
      defaultAccentColor="#65a30d"
      renderPreview={(fields, template, branding, layoutId) => (
        <BuilderDocPreview fields={fields} template={template} branding={branding} layoutId={layoutId} />
      )}
    />
  );
}
