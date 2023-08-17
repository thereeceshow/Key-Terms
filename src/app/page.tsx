"use client";

import Papa from "papaparse";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  Card,
  Text,
  Divider,
  Title,
  TextInput,
  ProgressBar,
  ButtonProps,
  Subtitle,
} from "@tremor/react";
import { SearchIcon } from "@heroicons/react/solid";
import { validateHeaderValue } from "http";
import { arrayBuffer } from "stream/consumers";
import { constants } from "http2";
import { randomInt } from "crypto";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [renderData, setRenderData] = useState("");
  const [searchTxt, setSearchTxt] = useState("");
  const [sprintCount, setSprintCount] = useState(16);
  // const [activeButton, setActiveButton] = useState(0);
  const [sprintLimit, setSprintLimit] = useState(0);
  const [filters, setFilters] = useState({ highlight: false, current: false})

  useEffect(() => {
    fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1SRoyB12qwt1gFTrUWxN2xTEQxp-4p7rnvbIdGLs_PdM_wmTd6QFIUQvRtVNh2_jA5_uTbdMCYv2D/pub?gid=547329396&single=true&output=csv",
      {
        headers: {
          "content-type": "text/csv;charset=UTF-8",
        },
      }
    )
      .then((res) => res.text())
      .then((v) => Papa.parse(v))
      .then((data) => {
        const dataToObjArr = data.data.map((el) => {
          return {
            term: el[0],
            def: el[1],
            sprint: el[2],
          };
        });
        setData(dataToObjArr);
        setRenderData(dataToObjArr);

        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTxt || sprintLimit != 0) {
      const sprintFilter = (value: number) => {
        if (sprintLimit == 0) {
          return true
        }
        if (filters.current == false) {
          return value <= sprintLimit
        } else {
          return value == sprintLimit
        }}
      setRenderData(
        data
          .filter((el) => {
            return Object.values(el).some((s) =>
              s.toLowerCase().includes(searchTxt.toLocaleLowerCase())
            );
          })
          .filter((el) => sprintFilter(el.sprint))
      );
    } else {
      setRenderData(data);
    }
  }, [data, searchTxt, sprintLimit, filters.current]);

  const toogleCurrent = () => {
    setFilters({...filters, current: !filters.current})
  }

  const toogleHighlight = () => {
    setFilters({...filters, highlight: !filters.highlight})
  }

  interface SprintButtonProps {
    value: number;
    children?: any;
  }

  const Button: React.FC<SprintButtonProps> = ({
    value,
  }: SprintButtonProps) => {
    const rendValue: string | number = value === 0 ? "All" : value;
    return (
      <button
        className={`align-bottom rounded-full box-content aspect-square w-7 ${
          filters.current ? (value == sprintLimit ? "active" : "border-dashed border-y border-x-2") :
          (value <= sprintLimit ? "active" : "border-dashed border-y border-x-2")
        }`}
        value={value.toString()}
        onClick={(e) => {
          setSprintLimit(e.target.value);
        }}
      >
        {rendValue}
      </button>
    );
  };

  const SprintButtons = () => {
    let tempArr = [];
    for (let i: number = 0; i <= sprintCount; i++) {
      tempArr.push(<Button value={i} key={i} />);
    }
    return tempArr;
  };

  const buttonClick = (tar) => {
    setSprintLimit(tar.value);
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center place-items-center place-content-center">
        <div className="bg-yellow-400 p-3 rounded-md flex delay-300 transition duration-300 ease-in origin-top-right hover:-rotate-[37deg]">
          <div className="h-8 w-8 aspect-square rounded-full border-dotted border-l-4 border-red-700 border-t-4 border-r-4 border-b-8 animate-spin"></div>
          <pre className="animate-pulse"> ...Loading</pre>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-between p-24">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 w-full">
        <Card className="col-span-full flex flex-col justify-start mb-3 bg-slate-500">
          <div className="grid grid-cols-6 pt-2">
            <div className="col-span-1 text-white">Filter by Keyword:</div>
            <TextInput
              className="col-span-5 me-6"
              value={searchTxt}
              icon={SearchIcon}
              placeholder="Search..."
              onChange={(e) => setSearchTxt(e.target.value)}
            />
            <div className="col-span-1 mt-5 text-white text-bottom">
              Filter by Sprint
            </div>
            <div className="col-span-5 mt-5 text-white w-full">
              <div className="flex justify-between">
                <SprintButtons />
              </div>
              <div className="flex justify-between">
                <ProgressBar
                  value={(sprintLimit / 16) * 100}
                  color="green"
                  className="mt-3"
                />
              </div>
            </div>
          </div>
            <div className="flex justify-center gap-12 w-full mt-8">
              <button className={`bg-slate-600 border-2 text-white p-2 rounded-lg ${filters.highlight && 'active'}`} onClick={toogleHighlight}>
              <div className="col-span-1">
                  {filters.highlight ? 'Highlight None' : 'Highlight Selected Sprint Terms'}
                </div>
              </button>
              <button className={`bg-slate-600 border-2 text-white p-2 rounded-lg ${filters.current && 'active'}`} onClick={toogleCurrent}>
              <div className="col-span-1">
                  {filters.current ?  'Show All Previous Sprints' : 'Show Only Selected Sprint'}
                </div>
              </button>
            </div>
        </Card>
        {renderData &&
          renderData.map((el, key) => {
            return (
              <Card className={`px-3 ${filters.highlight && el.sprint == sprintLimit ? "bg-green-200" : ""}`} key={key}>
                <Title className="font-bold">{el.term}</Title>
                <Divider />
                <Text className="my-3 ms-2 italic">{el.def}</Text>
                <Subtitle
                  className={`delay-[${new Number(
                    randomInt
                  )}ms] animate-pulse px-2 absolute bg-gradient-to-t from-neutral-50 to-transparent text-center bottom-3 right-4 border-double border-4 rounded-full box-content aspect-square border-slate-300`}
                >
                  {el.sprint}
                </Subtitle>
              </Card>
            );
          })}
      </div>
    </main>
  );
}
