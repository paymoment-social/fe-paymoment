import { CONVERSATIONS } from "../constants";
export async function getConversations() { await new Promise((resolve) => setTimeout(resolve, 320)); return CONVERSATIONS; }
