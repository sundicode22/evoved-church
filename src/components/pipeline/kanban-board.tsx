"use client"

import * as React from "react"
import { useKanbanStore } from "@/store/use-kanban-store"
import { DealDrawer } from "@/components/pipeline/deal-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  HelpCircleIcon,
  Download01Icon,
  PlusSignIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  Calendar03Icon,
  Task01Icon,
  Folder01Icon,
  Image01Icon,
  Building01Icon,
} from "@hugeicons/core-free-icons"

export function KanbanBoard() {
  const { searchQuery, setSearchQuery, activeView, setActiveView, openDealDrawer } = useKanbanStore()

  const columns = [
    {
      id: "prospection",
      title: "PROSPECTION",
      totalAmount: "$6,500.00",
      count: "8 deals",
      cards: [
        {
          id: "deal-1",
          title: "Plumbing Services",
          location: "345 Park Ave S",
          contact: "Jane Cooper",
          initials: "J",
          avatarColor: "bg-blue-100 text-blue-700",
          amount: "$860.00",
          elapsed: "1m",
          assignee: "Jane Cooper",
          metrics: { cal: 1, check: 2, folder: 0, img: 1 },
        },
        {
          id: "deal-2",
          title: "Roofing Repairs",
          location: "4517 Washington Ave",
          contact: "Annette Willie",
          initials: "A",
          avatarColor: "bg-emerald-100 text-emerald-700",
          amount: "$1,520.00",
          elapsed: "30m",
          assignee: "Annette Willie",
          metrics: { cal: 1, check: 2, folder: 1, img: 0 },
        },
        {
          id: "deal-3",
          title: "Paint & Drywall Repairs",
          location: "255 Columbus Cir",
          contact: "Kathryn Murphy",
          initials: "K",
          avatarColor: "bg-purple-100 text-purple-700",
          amount: "$2,480.00",
          elapsed: "2h",
          assignee: "Kathryn Murphy",
          metrics: { cal: 1, check: 3, folder: 1, img: 6 },
        },
        {
          id: "deal-4",
          title: "Cleaning",
          location: "190 Beach 64th St",
          contact: "Bryan Smith",
          initials: "B",
          avatarColor: "bg-zinc-200 text-zinc-700",
          amount: "$520.00",
          elapsed: "5h",
          assignee: "Bryan Smith",
          metrics: { cal: 1, check: 2, folder: 1, img: 8 },
        },
        {
          id: "deal-5",
          title: "Chimney Sweeps",
          location: "8502 Preston St",
          contact: "Eleanor Pena",
          initials: "E",
          avatarColor: "bg-amber-100 text-amber-700",
          amount: "$1,250.00",
          elapsed: "1d",
          assignee: "Eleanor Pena",
          metrics: { cal: 2, check: 1, folder: 0, img: 2 },
        },
      ],
    },
    {
      id: "request_received",
      title: "REQUEST RECEIVED",
      totalAmount: "$4,290.00",
      count: "5 deals",
      cards: [
        {
          id: "deal-6",
          title: "Landscaping",
          location: "26 Federal Plaza #3541",
          contact: "Darlene Robertson",
          initials: "D",
          avatarColor: "bg-pink-100 text-pink-700",
          amount: "$1,200.00",
          elapsed: "5m",
          assignee: "Darlene Robertson",
          metrics: { cal: 3, check: 1, folder: 0, img: 12 },
        },
        {
          id: "deal-7",
          title: "Kitchen Installation",
          location: "1740 Madison Ave",
          contact: "Leslie Alexander",
          initials: "L",
          avatarColor: "bg-sky-100 text-sky-700",
          amount: "$960.00",
          elapsed: "23m",
          assignee: "Leslie Alexander",
          metrics: { cal: 1, check: 1, folder: 1, img: 9 },
        },
        {
          id: "deal-8",
          title: "Backyard Cleaning",
          location: "2118 Thornridge Cir",
          contact: "Ronald Richards",
          initials: "R",
          avatarColor: "bg-orange-100 text-orange-700",
          amount: "$1,120.00",
          elapsed: "2h",
          assignee: "Ronald Richards",
          metrics: { cal: 1, check: 2, folder: 1, img: 10 },
        },
        {
          id: "deal-8b",
          title: "Pest Control",
          location: "3517 W. Gray St",
          contact: "Ronald Richards",
          initials: "A",
          avatarColor: "bg-lime-100 text-lime-700",
          amount: "$440.00",
          elapsed: "1m",
          assignee: "Ronald Richards",
          metrics: { cal: 0, check: 2, folder: 0, img: 16 },
        },
      ],
    },
    {
      id: "proposal_sent",
      title: "PROPOSAL SENT",
      totalAmount: "$7,280.00",
      count: "7 deals",
      cards: [
        {
          id: "deal-9",
          title: "Roofing Repairs",
          location: "110 William St",
          contact: "Jenny Wilson",
          initials: "J",
          avatarColor: "bg-emerald-100 text-emerald-700",
          amount: "$1,970.00",
          elapsed: "3m",
          assignee: "Jenny Wilson",
          metrics: { cal: 1, check: 4, folder: 1, img: 19 },
        },
        {
          id: "deal-10",
          title: "Paint & Drywall Repairs",
          location: "2972 Washington Ave",
          contact: "Brian Robbin",
          initials: "B",
          avatarColor: "bg-pink-100 text-pink-700",
          amount: "$2,480.00",
          elapsed: "47m",
          assignee: "Brian Robbin",
          metrics: { cal: 1, check: 3, folder: 1, img: 8 },
        },
        {
          id: "deal-10b",
          title: "Paint & Drywall Repairs",
          location: "1547 E New York Ave",
          contact: "Marvin McKinney",
          initials: "M",
          avatarColor: "bg-blue-100 text-blue-700",
          amount: "$800.00",
          elapsed: "5h",
          assignee: "Marvin McKinney",
          metrics: { cal: 1, check: 1, folder: 1, img: 12 },
        },
        {
          id: "deal-10c",
          title: "Gutter Cleaning",
          location: "641 Lexington Ave #4",
          contact: "Guy Hawkins",
          initials: "G",
          avatarColor: "bg-teal-100 text-teal-700",
          amount: "$420.00",
          elapsed: "10h",
          assignee: "Guy Hawkins",
          metrics: { cal: 0, check: 1, folder: 0, img: 6 },
        },
      ],
    },
    {
      id: "proposal_accepted",
      title: "PROPOSAL ACCEPTED",
      totalAmount: "$12,920.00",
      count: "12 deals",
      cards: [
        {
          id: "deal-11",
          title: "Plumbing Services",
          location: "2972 Westheimer Rd",
          contact: "Eleanor Pena",
          initials: "E",
          avatarColor: "bg-purple-100 text-purple-700",
          amount: "$990.00",
          elapsed: "1m",
          assignee: "Eleanor Pena",
          metrics: { cal: 0, check: 2, folder: 0, img: 12 },
        },
        {
          id: "deal-12",
          title: "Roofing Repairs",
          location: "58 Columbus Cir",
          contact: "Dianne Russel",
          initials: "D",
          avatarColor: "bg-amber-100 text-amber-700",
          amount: "$1,520.00",
          elapsed: "1w",
          assignee: "Dianne Russel",
          metrics: { cal: 3, check: 1, folder: 0, img: 8 },
        },
        {
          id: "deal-13",
          title: "Cracked Repair",
          location: "115 Eldridge St",
          contact: "Kristin Watson",
          initials: "K",
          avatarColor: "bg-rose-100 text-rose-700",
          amount: "$1,240.00",
          elapsed: "Jan 5",
          assignee: "Kristin Watson",
          metrics: { cal: 2, check: 1, folder: 0, img: 16 },
        },
        {
          id: "deal-14",
          title: "Plumbing Services",
          location: "4517 Washington Ave",
          contact: "Ralph Edwards",
          initials: "R",
          avatarColor: "bg-blue-100 text-blue-700",
          amount: "$1,290.00",
          elapsed: "Jan 9",
          assignee: "Ralph Edwards",
          metrics: { cal: 2, check: 1, folder: 0, img: 9 },
        },
      ],
    },
  ]

  return (
    <div className="flex flex-1 flex-col bg-[#fbfcfb] dark:bg-zinc-950 min-h-screen">
      
      {/* TOP HEADER BAR */}
      <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Deals Pipeline
          </h1>

          <div className="flex items-center gap-3">
            <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 transition-colors">
              <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4" />
            </button>
            <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 transition-colors">
              <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
            </button>

            <Button variant="outline" className="h-9 px-3.5 rounded-lg border-zinc-200 text-xs font-semibold gap-1.5 shadow-2xs">
              <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="size-3.5 text-zinc-600" />
              <span>Export</span>
            </Button>

            <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
              <span>Add Deal</span>
            </Button>
          </div>
        </div>

        {/* SUB-HEADER: TABS & FILTER TOOLBAR */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveView("pipeline")}
                className={`relative pb-2 transition-colors flex items-center gap-1.5 ${
                  activeView === "pipeline"
                    ? "text-[#16a34a] font-bold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#16a34a]"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <HugeiconsIcon icon={Building01Icon} strokeWidth={2} className="size-3.5" />
                <span>Pipeline</span>
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`relative pb-2 transition-colors flex items-center gap-1.5 ${
                  activeView === "list"
                    ? "text-[#16a34a] font-bold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#16a34a]"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <span>List</span>
              </button>
            </div>

            <div className="text-xs text-zinc-400 pl-2 border-l border-zinc-200">
              <span>Projected Deals: <strong className="text-zinc-700 dark:text-zinc-300">32</strong></span>
              <span className="mx-2">·</span>
              <span>Projected Revenue: <strong className="text-zinc-700 dark:text-zinc-300">$24,598.00</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <HugeiconsIcon
                icon={SearchIcon}
                strokeWidth={2}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400"
              />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-zinc-50 border-zinc-200 rounded-lg focus-visible:ring-emerald-500"
              />
            </div>

            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-zinc-600 border-zinc-200 rounded-lg gap-1.5">
              <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-3 text-zinc-500" />
              <span>Filter</span>
            </Button>

            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-zinc-600 border-zinc-200 rounded-lg gap-1.5">
              <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-3 text-zinc-500" />
              <span>Sort</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD COLUMNS */}
      <div className="flex flex-1 gap-6 p-8 overflow-x-auto items-start">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex w-72 shrink-0 flex-col rounded-2xl bg-[#f4f6f4]/60 dark:bg-zinc-900/40 p-3 border border-zinc-200/50"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1 pb-3 pt-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {col.title}
                </p>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {col.totalAmount} <span className="font-normal text-zinc-400 text-[11px]">· {col.count}</span>
                </p>
              </div>
              <button className="text-zinc-400 hover:text-zinc-600 p-1">
                <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4" />
              </button>
            </div>

            {/* Cards container */}
            <div className="flex flex-col gap-3">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => openDealDrawer(card.id)}
                  className="group relative cursor-pointer rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{card.location}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-zinc-400 hover:text-zinc-600">
                      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-3.5" />
                    </button>
                  </div>

                  {/* Contact pill & value */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${card.avatarColor}`}>
                        {card.initials}
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">{card.contact}</span>
                    </div>

                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{card.amount}</p>
                  </div>

                  {/* Card footer: metrics & elapsed time */}
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5 text-[11px] text-zinc-400 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.8} className="size-3" />
                        <span>{card.metrics.cal}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon icon={Task01Icon} strokeWidth={1.8} className="size-3" />
                        <span>{card.metrics.check}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon icon={Folder01Icon} strokeWidth={1.8} className="size-3" />
                        <span>{card.metrics.folder}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon icon={Image01Icon} strokeWidth={1.8} className="size-3" />
                        <span>{card.metrics.img}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-zinc-400">{card.elapsed}</span>
                      <div className="size-5 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] font-bold text-white shadow-2xs">
                        AF
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL SLIDE-OVER DRAWER */}
      <DealDrawer />
    </div>
  )
}
