"use client";
/*
 * Documentation:
 * Stats Card — https://app.subframe.com/8fbe3cdb8345/library?component=Stats+Card_ce8a575f-7dd0-409b-8e4d-98c260a65cb1
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherDollarSign } from "@subframe/core";

interface StatsCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  value?: React.ReactNode;
  className?: string;
}

const StatsCardRoot = React.forwardRef<HTMLElement, StatsCardRootProps>(
  function StatsCardRoot(
    {
      icon = <FeatherDollarSign />,
      label,
      value,
      className,
      ...otherProps
    }: StatsCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-5 py-4 shadow-sm",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
          <div className="flex w-full items-center gap-1">
            {label ? (
              <span className="line-clamp-1 grow shrink-0 basis-0 text-body font-body text-subtext-color">
                {label}
              </span>
            ) : null}
            {icon ? (
              <SubframeCore.IconWrapper className="text-body-bold font-body-bold text-neutral-400">
                {icon}
              </SubframeCore.IconWrapper>
            ) : null}
          </div>
          {value ? (
            <span className="w-full text-heading-2 font-heading-2 text-brand-700">
              {value}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

export const StatsCard = StatsCardRoot;
