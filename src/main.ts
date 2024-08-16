import "./style.css";
import typescriptLogo from "./assets/typescript.svg";
import { setupCounter } from "./counter.ts";

function app() {
  const appElement = document.getElementById("app");
  const counterButton = document.createElement("button");

  const appImage = document.createElement("img");
  appImage.src = typescriptLogo;
  appImage.className = "logo";

  counterButton.id = "counter";
  setupCounter(counterButton);

  appElement?.appendChild(appImage);
  appElement?.appendChild(counterButton);
}

app();
