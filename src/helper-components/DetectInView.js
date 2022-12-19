import { useState, useEffect } from "react";

function useDetectInView(ref, disabled) {
  const [isInView, setIsInView] = useState(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    let target = ref.current;

    let callback = function (intObv) {
      if (intObv[0].isIntersecting) {
        console.log("element in view.");
        observer.unobserve(target);
        setIsInView(true);
      }
    };
    let options = {
      rootMargin: "1000px",
      threshold: 1.0,
    };
    let observer = new IntersectionObserver(callback, options);
    observer.observe(target);

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  return isInView;
}

export default useDetectInView;
