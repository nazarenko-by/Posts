// OverengineeredButton.tsx — Code review #2
// "До": Strategy pattern + фабрика заради двох варіантів кнопки,
// які більше ніколи не зміняться.

import React from "react";

abstract class ButtonStrategy {
  abstract className(): string;
}
class PrimaryButtonStrategy extends ButtonStrategy {
  className() {
    return "btn-primary";
  }
}
class SecondaryButtonStrategy extends ButtonStrategy {
  className() {
    return "btn-secondary";
  }
}

class ButtonFactory {
  private static strategies = new Map<string, ButtonStrategy>([
    ["primary", new PrimaryButtonStrategy()],
    ["secondary", new SecondaryButtonStrategy()],
  ]);

  static create(type: string): ButtonStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) throw new Error(`Unknown button type: ${type}`);
    return strategy;
  }
}

export function OverengineeredButton({
  type,
  children,
}: {
  type: "primary" | "secondary";
  children: React.ReactNode;
}) {
  const strategy = ButtonFactory.create(type);
  return <button className={strategy.className()}>{children}</button>;
}
