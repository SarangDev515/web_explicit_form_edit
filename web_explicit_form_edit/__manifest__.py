{
    "name": "Explicit Form Edit / Save Buttons",
    "version": "19.0.1.1.0",
    "summary": "Read-only forms with explicit Edit, Save and Discard buttons",
    "category": "Tools/UI",
    "license": "LGPL-3",
    "images": ["static/description/cover.png"],
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_explicit_form_edit/static/src/js/form_controller.js",
            "web_explicit_form_edit/static/src/xml/form_controller.xml",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
