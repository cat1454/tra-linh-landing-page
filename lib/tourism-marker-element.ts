export function createTourismMarkerElement(
  placeName: string,
  onSelect: () => void,
): HTMLButtonElement {
  const element = document.createElement("button");
  element.type = "button";
  element.setAttribute("role", "button");
  element.setAttribute("aria-label", `Chọn ${placeName} trên bản đồ`);
  element.setAttribute("aria-pressed", "false");
  element.classList.add(
    "rounded-full",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-[#D5A84E]",
  );
  element.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelect();
  });
  return element;
}

export function updateTourismMarkerElement(
  element: HTMLElement,
  active: boolean,
): void {
  // Mapbox assigns role="img" when it mounts a custom marker. Restore the
  // native button semantics before exposing the selected state.
  element.setAttribute("role", "button");
  element.setAttribute("aria-pressed", String(active));
}
