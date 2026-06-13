JA Experiences & Discovery — GetYourGuide Integration Pack

Use on the local development branch only.

Files included:
- activities-and-experiences.html
- destinations.html
- affiliate-disclosure.html

Install:
1. In VS Code, confirm you are on the development branch:
   git branch --show-current

2. Copy these three files into the root of the JA-EXPERIENCES-DISCOVERY project, replacing the existing files.

3. Preview locally:
   Start-Process .\activities-and-experiences.html
   Start-Process .\destinations.html
   Start-Process .\affiliate-disclosure.html

4. Check:
   - Header and footer still match the JA product theme.
   - Destination search works.
   - City widgets load.
   - Featured tours load.
   - Referral/disclaimer wording appears.
   - No 'JAGS' wording appears.

5. Commit locally:
   git add .
   git commit -m "Integrate GetYourGuide activity widgets"
   git status

Do not push or publish the development branch yet.
