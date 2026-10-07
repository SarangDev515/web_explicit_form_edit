# Explicit Form Edit / Save Buttons — Odoo 19

Frontend-only addon for standard backend full-page form views.

## Behavior
- Read-only mode shows New / Edit; edit mode shows only Save / Discard (subject to view permissions).
- Existing records start read-only. Click Edit to unlock fields.
- New opens directly in edit mode with Save / Discard; no extra Edit click is needed.
- Clicking a locked field or its label makes Edit jump twice as a reminder. Links and action buttons are excluded; repeated clicks do not stack animations. Reduced-motion users see two subtle opacity pulses instead.
- Edit and Discard use btn-secondary. Save keeps its outlined-primary style, and New keeps its native Odoo style.
- Native cloud-save and X-discard indicators are replaced on these forms.
- Successful explicit Save or Discard returns an existing record to read-only mode.
- Failed validation keeps the form editable.
- Discarding a new unsaved record uses Odoo's normal back navigation.
- Pager navigation and Duplicate lock the newly opened root record.
- Popup dialogs, wizards, and forms without a control panel retain native behavior.
- Read-only fields, view edit/create restrictions, and server access rights remain effective.

## Installation
1. Ensure this extra_addons directory is in your Odoo configuration addons_path.
2. Restart the Odoo server.
3. Activate developer mode, open Apps, and choose Update Apps List.
4. Remove the default Apps filter and search for Explicit Form Edit / Save Buttons.
5. Install the module, then hard refresh the browser (Ctrl+Shift+R).

Technical module name: web_explicit_form_edit.

## Smoke tests on a development database
1. Open an existing Student record: fields are read-only; Edit is visible, native save/discard icons are absent.
2. Click Edit: allowed fields become editable and Save/Discard are visible.
3. Change a value and Save: value persists and fields lock.
4. Edit a value and Discard: original value returns and fields lock.
5. Clear a required field and Save: validation appears and fields stay editable.
6. Click New: form is immediately editable with Save / Discard; enter required values and Save. The saved record then becomes read-only.
7. Navigate with the pager and Duplicate: next form starts locked.
8. Check one2many fields, a user with limited permissions, and a popup wizard.
9. Check small-screen layout and other installed web customizations.

## Limits
This is a user-interface editing gate, not a security policy. Business-action buttons,
chatter, list-view editing, imports and API operations are not blocked. Odoo's native
automatic-save behavior during navigation, tab visibility changes and business actions
is retained; this module does not implement an explicit-save-only policy.

Source API checked against official Odoo 19.0 FormController, Record.switchMode and
FormView templates. Static validation is not a substitute for testing in your running
Odoo database. No database installation or server restart was performed by this task.

## Uninstall
Uninstall from Apps and hard refresh to restore native form behavior.
