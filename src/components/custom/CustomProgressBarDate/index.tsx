import { useEffect, useRef } from "react";

const CustomProgressBarDate = ({
  current,
  max,
}: any) => {
  const bar = useRef<any>(0);
  const calcPercent = (current: any, max: any) => {
    try {
      if (max <= 0 || !max) return "";
      const percent = ((current * 100) / max).toFixed(2);
      bar.current.style.width = `${percent}%`;
      return `${percent}%`;
    } catch (ex) {}
    return "";
  };
  useEffect(() => {
    calcPercent(current, max);
  }, [current, max]);
  return (
    <div className="p-2">
      <div className="mt-2 text-sm flex justify-between mb-2">
        <div className="w-full bg-[#1B2333] h-2 rounded-full overflow-hidden">
          <div
            ref={bar}
            className=" h-full bg-primary rounded-full max-w-full"
          ></div>
        </div>
      </div>
    </div>
  );
};
export default CustomProgressBarDate;
