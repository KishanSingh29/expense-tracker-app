import React from "react";
import Svg, { Circle, G } from "react-native-svg";

type Segment = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: Segment[];
  size?: number;
  strokeWidth?: number;
};

const DonutChart = ({ data, size = 180, strokeWidth = 26 }: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, segment) => sum + segment.value, 0);

  if (total <= 0) {
    return (
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>
    );
  }

  let cumulativePercent = 0;

  return (
    <Svg width={size} height={size}>
      <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
        {data.map((segment, index) => {
          const percent = segment.value / total;
          const strokeDasharray = `${circumference * percent} ${circumference}`;
          const strokeDashoffset = -cumulativePercent * circumference;
          cumulativePercent += percent;
          return (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              fill="none"
            />
          );
        })}
      </G>
    </Svg>
  );
};

export default DonutChart;
