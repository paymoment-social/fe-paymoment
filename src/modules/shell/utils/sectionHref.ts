import type { ShellSection } from "../types";
export function sectionHref(section: ShellSection) { return section === "for-you" ? "/" : `/${section}`; }
