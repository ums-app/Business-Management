import { useState, useEffect } from "react";

const usePersistentComponent = (components, defaultComponentName) => {
  const [displayComponent, setDisplayComponent] = useState(() => {
    const savedComponentName = localStorage.getItem("selectedComponent");
    const initialComponent = Object.values(components).find(
      (comp) => comp.name === savedComponentName
    );
    return initialComponent || components[defaultComponentName];
  });

  useEffect(() => {
    if (displayComponent) {
      localStorage.setItem("selectedComponent", displayComponent.name);
    }
  }, [displayComponent]);

  return [displayComponent, setDisplayComponent];
};

export default usePersistentComponent;
