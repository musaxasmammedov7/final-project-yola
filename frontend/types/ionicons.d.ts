import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
        size?: "small" | "large";
        color?: string;
      };
    }
  }
}
