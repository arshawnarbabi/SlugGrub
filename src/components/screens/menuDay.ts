// Owner: Arshawn. Which day a cafe or market menu is from, in one wording for the Halls board and each location's menu page:
// "Today's menu(s)", or "Menu(s) from Monday" when it is closed today (cafes and markets close on weekends).
export function menuFromNote(menuDate: string | undefined, today: string, plural = false): string {
  if (!menuDate || menuDate === today) return plural ? "Today's menus" : "Today's menu";
  const weekday = new Date(`${menuDate}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  return `${plural ? "Menus" : "Menu"} from ${weekday}`;
}
