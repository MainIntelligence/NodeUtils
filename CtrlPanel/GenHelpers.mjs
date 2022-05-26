
export function Elm(tag) { return document.createElement(tag); };
export function Div() { return Elm('div'); }
export function CSSElm(tag, csstext) {
  let div = Elm(tag);
  div.style.cssText = csstext;
  return div;
}
export function CSSDiv(csstext) {
  let div = Div();
  div.style.cssText = csstext;
  return div;
}

export function AppendChildren(...tags) {
  tags.reduce((parent, child) => {
    parent.appendChild(child);
    return parent;
  });
}
