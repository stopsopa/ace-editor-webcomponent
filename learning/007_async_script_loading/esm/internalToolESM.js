export function internalToolESM(el) {
  el.classList.add("my-tool-class");

  const span = document.createElement("span");
  span.textContent = "My Tool is Loaded";
  el.appendChild(span);
}
