import GenericBuilder from '@/components/GenericBuilder';
import BuilderDocPreview from '@/components/BuilderDocPreview';

export default function PolicyBuilderPage() {
  return (
    <GenericBuilder
      builderId="policy"
      title="Policy Builder"
      subtitle="Privacy policies, H&S, safeguarding, complaints, terms of service"
      metaDescription="Create professional business and website policies including privacy policy, cookie policy, health & safety, safeguarding, and terms of service."
      defaultAccentColor="#16a34a"
      renderPreview={(fields, template, branding, layoutId) => (
        <BuilderDocPreview fields={fields} template={template} branding={branding} layoutId={layoutId} />
      )}
    />
  );
}
