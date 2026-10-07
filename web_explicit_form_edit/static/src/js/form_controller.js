/** @odoo-module **/

import { useEffect, useRef, useState } from "@odoo/owl";
import { patch } from "@web/core/utils/patch";
import { FormController } from "@web/views/form/form_controller";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        this.explicitFormState = useState({ busy: false });
        this.explicitEditButtonRef = useRef("explicitEditButton");
        this.explicitEditReminderAnimation = null;
        // Capture field clicks even when a field widget stops event bubbling.
        useEffect(() => {
            const root = this.rootRef.el;
            if (!root || !this.useExplicitFormEdit) {
                return;
            }
            const onFieldClick = (event) => this.remindExplicitEdit(event);
            root.addEventListener("click", onFieldClick, true);
            return () => {
                root.removeEventListener("click", onFieldClick, true);
                this.explicitEditReminderAnimation?.cancel();
                this.explicitEditReminderAnimation = null;
            };
        }, () => []);
        // Existing records start locked; unsaved new records stay editable.
        // Mode changes do not change the root ID, so clicking Edit stays editable.
        useEffect(
            () => {
                if (this.useExplicitFormEdit && !this.model.root.isNew &&
                    this.model.root.isInEdition) {
                    this.model.root.switchMode("readonly");
                }
            },
            () => [this.model.root.id]
        );
    },

    get useExplicitFormEdit() {
        return !this.env.inDialog && Boolean(this.display.controlPanel);
    },

    get canExplicitlyEdit() {
        return !this.props.readonly &&
            (this.model.root.isNew ? this.canCreate : this.canEdit);
    },

    get modelParams() {
        const params = super.modelParams;
        if (!this.env.inDialog && this.display.controlPanel) {
            params.config.mode = this.props.resId || this.props.readonly ? "readonly" : "edit";
        }
        return params;
    },

    remindExplicitEdit(event) {
        if (!this.useExplicitFormEdit || this.model.root.isInEdition ||
            !this.canExplicitlyEdit || this.explicitFormState.busy) {
            return;
        }
        const target = event.target instanceof Element ? event.target : null;
        const field = target?.closest(".o_field_widget, .o_form_label");
        if (!field || !this.rootRef.el.contains(field)) {
            return;
        }
        // Navigation links and widget action buttons are not editing attempts.
        if (target.closest("a, button, [role='button']")) {
            return;
        }
        const button = this.explicitEditButtonRef.el;
        if (!button || this.explicitEditReminderAnimation?.playState === "running") {
            return;
        }
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const frames = reducedMotion
            ? [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }]
            : [
                { transform: "translateY(0)", offset: 0 },
                { transform: "translateY(-9px)", offset: 0.4 },
                { transform: "translateY(0)", offset: 1 },
            ];
        // Exactly two jumps. Repeated clicks during the reminder don't stack.
        this.explicitEditReminderAnimation = button.animate(frames, {
            duration: 340,
            iterations: 2,
            easing: "ease-in-out",
        });
    },

    async explicitEdit() {
        if (!this.canExplicitlyEdit || this.explicitFormState.busy) {
            return;
        }
        this.explicitEditReminderAnimation?.cancel();
        this.explicitFormState.busy = true;
        try {
            await this.model.root.switchMode("edit");
        } finally {
            this.explicitFormState.busy = false;
        }
    },

    async saveButtonClicked(params = {}) {
        if (!this.useExplicitFormEdit) {
            return super.saveButtonClicked(params);
        }
        if (!this.model.root.isInEdition || this.explicitFormState.busy) {
            return false;
        }
        this.explicitFormState.busy = true;
        try {
            const saved = await super.saveButtonClicked(params);
            // Failed validation must leave the form editable.
            if (saved) {
                await this.model.root.switchMode("readonly");
            }
            return saved;
        } finally {
            this.explicitFormState.busy = false;
        }
    },

    async discard() {
        if (!this.useExplicitFormEdit) {
            return super.discard(...arguments);
        }
        if (this.explicitFormState.busy) {
            return;
        }
        this.explicitFormState.busy = true;
        const record = this.model.root;
        const wasNew = record.isNew;
        try {
            await super.discard(...arguments);
            // Native Odoo discard navigates away from an unsaved new record.
            if (!wasNew && this.model.root === record) {
                await record.switchMode("readonly");
            }
        } finally {
            this.explicitFormState.busy = false;
        }
    },
});
