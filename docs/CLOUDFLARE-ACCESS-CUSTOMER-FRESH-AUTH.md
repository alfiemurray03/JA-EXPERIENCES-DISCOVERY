# Customer Portal Fresh Authentication

## Outcome

The application logout chain is already complete: it revokes the customer session in D1, expires the `ja_customer_session` cookie, ends the Cloudflare Access session, and then opens the Microsoft Entra logout endpoint.

The remembered Microsoft account shown afterwards is browser and Microsoft identity-provider state. It is not an active JA Experiences application session and must not be cleared by application code.

Fresh authentication on the next visit must be requested by Cloudflare Access because Access, rather than the application, constructs the next Microsoft OpenID Connect authorisation request.

## Supported setting

Cloudflare documents the `prompt` property on a Microsoft Entra ID identity-provider configuration:

- `prompt: "login"` requires Microsoft to ask the user to authenticate again and prevents silent single sign-on for that authorisation request.
- `prompt: "select_account"` displays the account selector but does not require credentials, so it does not meet this requirement.
- `max_age=0` is defined by OpenID Connect, but it is not listed in Microsoft's current authorisation-request guidance or exposed in Cloudflare's documented Microsoft Entra ID provider configuration. It is therefore not used here. Do not append it to the logout URL; freshness parameters belong on an authorisation request, which Cloudflare controls.

Microsoft may still display a remembered account. Depending on the tenant's authentication methods, fresh authentication may use a password, passkey, Windows Hello, security key, authenticator approval, or another approved factor.

## Manual Cloudflare Zero Trust configuration

These settings cannot be applied by Pages Functions or front-end code.

1. In **Cloudflare Zero Trust → Integrations → Identity providers**, determine whether the Microsoft Entra ID provider used by the Customer Portal is also used by the Administrator Control Centre or another Access application.
2. If it is shared, create a separate Microsoft Entra ID provider configuration for the Customer Portal before setting `prompt`. This avoids forcing the same behaviour on unrelated applications. Retain the existing tenant, redirect URI, client credentials, group support, Conditional Access integration, and other security settings.
3. In **Access controls → Applications**, open the self-hosted Customer Portal application protecting `experiences.jagroupservices.co.uk/account/*`.
4. Allow only the customer-specific Microsoft Entra ID provider for this application. Preserve every existing Access policy, group restriction, session duration, and application path. Do not add a Bypass policy.
5. Update that identity provider through the Cloudflare API. First `GET` the complete current provider document, then `PUT` the complete document back with this property added inside `config`:

   ```json
   {
     "config": {
       "prompt": "login"
     }
   }
   ```

   The fragment above is illustrative only. Cloudflare requires the `PUT` request to contain **all existing provider fields**; omitting fields can remove configuration. Use an API token restricted to the necessary Access identity-provider read/write permissions, never commit it, and revoke it after use if it was created for this change.
6. If the Customer Portal has one allowed identity provider, keep **Apply instant authentication** enabled where already used. This changes only provider selection; it does not replace Access or Entra authentication.

Cloudflare's current procedure and request shape are documented in [Microsoft Entra ID — Force user interaction during device client reauthentication](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/entra-id/#force-user-interaction-during-device-client-reauthentication). Microsoft's `prompt` semantics are documented in [OpenID Connect on the Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc#send-the-sign-in-request).

## Validation checklist

Perform this in a production-safe test account after the customer-specific identity provider is assigned:

1. Sign in to `/account/` and confirm the Customer Portal loads normally.
2. Sign out through `/account/logout`.
3. Confirm the corresponding `customer_sessions` row has `revoked_at` populated and the `ja_customer_session` cookie is expired.
4. Confirm `/cdn-cgi/access/logout` completes before the browser proceeds to `/signed-out/microsoft-logout` and then `/signed-out/`.
5. Return to `/account/`. Confirm Cloudflare Access still protects the route and Microsoft requires fresh authentication rather than completing silent SSO.
6. Confirm the remembered account may remain visible, but selecting it still requires an approved authentication action.
7. Confirm an unauthorised account remains denied and no Bypass policy exists.
8. Confirm the Administrator Control Centre login and logout behaviour is unchanged.
9. Review Cloudflare Access authentication logs, Microsoft Entra sign-in logs, browser console, and Pages Functions logs for errors or redirect loops.

If stronger tenant-wide session assurance is required, Microsoft Entra Conditional Access also supports sign-in-frequency session controls, including reauthentication every time. That is a separate licensed governance decision and should be tested in report-only or a limited pilot before enforcement; it is not required for this Cloudflare `prompt=login` change.
