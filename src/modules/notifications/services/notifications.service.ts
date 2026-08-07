import { NOTIFICATIONS } from "../constants";
export async function getNotifications() { await new Promise((resolve) => setTimeout(resolve, 300)); return NOTIFICATIONS; }
