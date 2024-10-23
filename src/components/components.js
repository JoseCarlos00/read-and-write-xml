import { InputCheckbox } from "./Checkbox.js";
import { FadeHeader } from "./FadeHeader.js";

customElements.define(InputCheckbox.nameElement, InputCheckbox);
customElements.define(FadeHeader.nameElement, FadeHeader, { extends: "header" });
