import { useEffect, useRef } from "react";
import { createApp, type App as VueApp } from "vue";
import { OrderPrinciples } from "../vue/OrderPrinciples";

export function VueIsland() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) {
      return undefined;
    }

    const app: VueApp = createApp(OrderPrinciples);
    app.mount(hostRef.current);

    return () => {
      app.unmount();
    };
  }, []);

  return <div ref={hostRef} />;
}
