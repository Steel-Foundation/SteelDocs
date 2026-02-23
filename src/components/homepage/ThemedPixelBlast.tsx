import { useState, useEffect } from "react";
import PixelBlast from "./PixelBlast";

interface Props {
  [key: string]: unknown;
}

export default function ThemedPixelBlast(props: Props) {
  const [isDark, setIsDark] = useState(
    () => typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return <PixelBlast {...props} color={isDark ? "#022120" : "#97F6E5"} />;
}
