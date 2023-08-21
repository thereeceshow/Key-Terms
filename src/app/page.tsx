"use client";

import Papa from "papaparse";
import { useEffect, useState } from "react";
import {
  Card,
  Text,
  Divider,
  Title,
  TextInput,
  ProgressBar,
  Subtitle,
  Select,
  SelectItem,
} from "@tremor/react";
import { SearchIcon } from "@heroicons/react/solid";
import { validateHeaderValue } from "http";
import { arrayBuffer } from "stream/consumers";
import { constants } from "http2";
import { randomInt } from "crypto";
import Image from "next/image";
import badge from './badge.png'

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ term: string; def: string; sprint: string; }[]>([]);
  const [renderData, setRenderData] = useState<{ term: string; def: string; sprint: string; }[]>([]);
  const [searchTxt, setSearchTxt] = useState("");
  const [sprintCount, setSprintCount] = useState(16);
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
        const parsedData = data as { data: string[][]}
        const dataToObjArr = parsedData.data.map((el) => {
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
          .filter((el) => sprintFilter(Number(el.sprint)))
      );
    } else {
      setRenderData(data);
    }
  }, [data, searchTxt, sprintLimit, filters]);

  const toggleCurrent = () => {
    setFilters({...filters, current: !filters.current})
  }

  const toggleHighlight = () => {
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
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          const newValue = Number(e.currentTarget.value)
          setSprintLimit(newValue);
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

  const SprintDropDownItems = () => {
    let tempArr = [];
    for (let i: number = 0; i <= sprintCount; i++) {
      tempArr.push(
        <SelectItem value={i == 0 ? "All" : i.toString()} key={i}></SelectItem>
        );
        console.log(sprintLimit)
    }
    return tempArr;
  }

  const singleSprint = sprintLimit == 0 ? `All Sprints` : `Sprint ${sprintLimit}`
  const multiSprint = sprintLimit > 1 && !filters.current ? `Sprints 1 through ${sprintLimit}` : singleSprint

  const SprintDropDownList = () => {
    return (
      <Select
        value={sprintLimit.toString()}
        placeholder={multiSprint}
        onValueChange={(x) => {
          if (x == "All") x = 0
          console.log(`this is x ${x}`)
          setSprintLimit(Number(x))
          return x
          }}>
        <SprintDropDownItems />
      </Select>
    )
  }

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
    <main className="flex min-h-screen flex-col items-start justify-between p-1 md:p-24">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1 md:gap-4 lg:gap-6 w-full">
        <Card className="col-span-full flex flex-col justify-start mb-3 bg-slate-500">
          <div className="flex flex-row justify-center md:justify-start items-center align-text-middle border border-b-2 border-0 border-slate-400">
            <Image
              src={badge}
              alt="C.O.D.E. Icon"
              height={60}
              />
              <Title className="text-white align-text-middle">C.O.D.E. - Key Terms</Title>
          </div>
          <div className="grid grid-cols-6 pt-8">
            <div className="col-span-6 text-white">Filter by Keyword:</div>
            <TextInput
              className="col-span-6 mt-2"
              value={searchTxt}
              icon={SearchIcon}
              placeholder="Search..."
              onChange={(e) => setSearchTxt(e.target.value)}
            />
            <div className="col-span-6 mt-5 text-white text-bottom">
              Filter by Sprint:
            </div>
            <div className="col-span-6 mt-5 text-white w-full hidden md:block">
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
            <div className="md:hidden col-span-6">
              <SprintDropDownList />
            </div>
          </div>
            <div className="flex md:justify-center gap-3 md:gap-10 w-full mt-8">
              <button className={`w-full md:w-1/2 max-w-md bg-slate-600 border-2 text-white p-2 rounded-lg ${filters.highlight && 'active'}`} onClick={toggleHighlight}>
              <div className="col-span-1">
                  {filters.highlight ? 'Highlight None' : 'Highlight Selected Sprint Terms'}
                </div>
              </button>
              <button className={`w-full md:w-1/2 max-w-md  bg-slate-600 border-2 text-white p-2 rounded-lg ${filters.current && 'active'}`} onClick={toggleCurrent}>
              <div className="col-span-1">
                  {filters.current ?  'Show All Previous Sprints' : 'Show Only Selected Sprint'}
                </div>
              </button>
            </div>
        </Card>
        {renderData &&
          renderData.map((el, key) => {
            return (
              <Card className={`px-3 ${filters.highlight && Number(el.sprint) === sprintLimit ? "bg-green-200" : ""}`} key={key}>
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
