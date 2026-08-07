import { SHELL_SECTIONS } from "../constants";
export function isKnownSection(value: string) { return SHELL_SECTIONS.includes(value as never); }
