# PAL todo

## Product editor release

- [x] Add Easy and Advanced product modes with Persian field hints and an expandable guide.
- [x] Preserve entered values across mode switches and existing advanced settings during Easy edits.
- [x] Run typecheck, lint, build, 16 unit tests and 16 mocked browser checks on mobile and desktop.
- [ ] Confirm GitHub deployment succeeds for the product editor release.
- [ ] Verify both modes at https://palcoffee.ir/manage/products after deployment.
- [ ] Have an authorized admin create and edit a product with their own credentials; check its public page and image. Do not collect or log passwords.

## SMS and login

- [ ] Confirm the recipient received the already-authorized SMS test. Provider acceptance alone does not prove delivery; do not resend without approval.
- [ ] Complete an authorized end-to-end OTP check, including delivery, code verification and sign-in.
- [ ] Enable public OTP endpoints only after delivery and end-to-end checks pass. Keep the current HTTP 503 gate until then.
- [ ] Resolve the reported staff phone-input validation issue once the entered phone format and exact browser error are known. Never request the password.

## Recovery

- [ ] Set up private offsite backups for the production database and uploaded media; document retention and access.
- [ ] Restore a backup into an isolated environment and verify records and media without overwriting production.
