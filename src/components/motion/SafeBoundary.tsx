"use client";

import { Component, type ReactNode } from "react";

/**
 * Se um elemento decorativo falhar, ele simplesmente some — o convite continua
 * acessível. Usado em volta do envelope animado.
 */
export class SafeBoundary extends Component<{ children: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
    document.documentElement.dataset.envelope = "open";
    document.getElementById("convite")?.removeAttribute("inert");
    document.documentElement.style.removeProperty("overflow");
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
