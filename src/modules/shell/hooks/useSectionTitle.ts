import { SECTION_TITLES } from "../constants";
import type { ShellSection } from "../types";
export function useSectionTitle(section: ShellSection) { return SECTION_TITLES[section]; }
