import GenericBuilder from '@/components/GenericBuilder';
import BuilderDocPreview from '@/components/BuilderDocPreview';

export default function MinutesBuilderPage() {
  return (
    <GenericBuilder
      builderId="minutes"
      title="Minutes Builder"
      subtitle="Meeting minutes, board minutes, trustee minutes, resolutions, decision logs"
      metaDescription="Create professional meeting minutes, board minutes, trustee minutes, shareholder resolutions, director resolutions, and decision logs."
      defaultAccentColor="#0f766e"
      renderPreview={(fields, template, branding, layoutId) => (
        <BuilderDocPreview fields={fields} template={template} branding={branding} layoutId={layoutId} />
      )}
    />
  );
}
