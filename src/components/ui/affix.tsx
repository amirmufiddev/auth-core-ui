import React, { useRef, useState, useEffect } from "react";

type AffixProps = {
  children: React.ReactNode;
  offsetTop: number;
  target?: () => HTMLElement | null;
  onChange?: (affixed: boolean) => void;
};

const Affix = ({ children, offsetTop, onChange }: AffixProps) => {
  const [isFixed, setIsFixed] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current || !containerRef.current) return;

      const { top } = ref.current.getBoundingClientRect();
      const { top: containerTop } =
        containerRef.current.getBoundingClientRect();
      const shouldBeFixed = top <= offsetTop && containerTop < offsetTop;

      setIsFixed(shouldBeFixed);
      onChange?.(shouldBeFixed);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [offsetTop, onChange]);

  const affixStyles: React.CSSProperties = {
    position: isFixed ? "fixed" : "static",
    top: isFixed ? `${offsetTop}px` : "auto",
    width: "100%",
    zIndex: 1000,
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {isFixed && <div style={{ height: "50px" }} />}
      <div ref={ref} style={affixStyles}>
        {children}
      </div>
    </div>
  );
};

export default Affix;
