import GenericBuilder from '@/components/GenericBuilder';
import BuilderDocPreview from '@/components/BuilderDocPreview';

export default function ProposalBuilderPage() {
  return (
    <GenericBuilder
      builderId="proposal"
      title="Proposal Builder"
      subtitle="Business proposals, grants, tenders, sponsorships, project proposals"
      metaDescription="Create professional proposals including business proposals, grant applications, tender responses, sponsorship proposals, and project proposals."
      defaultAccentColor="#be185d"
      renderPreview={(fields, template, branding, layoutId) => (
        <BuilderDocPreview fields={fields} template={template} branding={branding} layoutId={layoutId} />
      )}
    />
  );
}
