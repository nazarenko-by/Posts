// SimpleButton.tsx — Code review #2
// "Після": один компонент з пропом variant - той самий результат, 5 рядків.

import React from "react";

export function SimpleButton({
  variant = "primary",
  children,
  ...props
}: {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn-${variant}`} {...props}>
      {children}
    </button>
  );
}
