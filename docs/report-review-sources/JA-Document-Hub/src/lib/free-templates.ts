/**
 * Free plan demo template configuration.
 *
 * Free users may only access the templates listed here.
 * All other templates are locked behind paid plans.
 *
 * To change the demo template, update FREE_TEMPLATE_ID below.
 */

/** The single template ID accessible on the free plan */
export const FREE_TEMPLATE_ID = 'general-formal-letter';

/** Convenience set for O(1) lookup */
export const FREE_TEMPLATE_IDS = new Set<string>([FREE_TEMPLATE_ID]);

/** Returns true if a template is accessible on the free plan */
export function isFreeTemplate(templateId: string): boolean {
  return FREE_TEMPLATE_IDS.has(templateId);
}
