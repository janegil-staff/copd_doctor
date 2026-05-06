import React from "react";

const Headline = ({ t }) => {
  return (
    <div className="w-full min-[900px]:w-auto min-[900px]:flex-1 min-[900px]:min-w-[300px] min-[900px]:max-w-[580px] text-center min-[900px]:text-left -mt-6 min-[900px]:-mt-10">
      <h1
        className="font-bold leading-tight"
        style={{
          color: "#268E86",
          fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
          fontFamily: "Georgia, serif",
        }}
      >
        {t.title}
      </h1>
    </div>
  );
};

export default Headline;