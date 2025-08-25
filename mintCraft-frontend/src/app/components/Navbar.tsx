"use client"

import * as React from "react"
import { X, Menu, MessageSquare, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const navigationItems = [
  { title: "CREATIVE WRITING SESSION", href: "#", time: "2 HOURS AGO" },
  { title: "IMAGE GENERATION CHAT", href: "#", time: "1 DAY AGO" },
  { title: "CODE REVIEW DISCUSSION", href: "#", time: "3 DAYS AGO" },
  { title: "MARKETING CONTENT IDEAS", href: "#", time: "1 WEEK AGO" },
]

export function Sidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" className="fixed top-6 right-6 z-50 brutalist-button-cyber w-14 h-14">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open chat history</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96 bg-white brutalist-border-thicc p-0">
        <SheetHeader className="p-6 bg-lime-400 brutalist-border-thick">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black brutalist-border flex items-center justify-center brutalist-shadow">
                <MessageSquare className="w-5 h-5 text-lime-400" />
              </div>
              <SheetTitle className="brutalist-title text-black text-xl">CHAT HISTORY</SheetTitle>
            </div>
            <Button size="icon" onClick={() => setOpen(false)} className="brutalist-button-danger w-8 h-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-4">
          {navigationItems.map((item, index) => (
            <div
              key={item.title}
              className="group p-4 bg-white brutalist-border brutalist-shadow hover:brutalist-shadow-electric transition-all duration-200 cursor-pointer animate-brutalist-bounce"
              onClick={() => setOpen(false)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="brutalist-text text-black text-sm mb-2">{item.title}</h3>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-black" />
                    <span className="text-xs font-bold text-gray-600">{item.time}</span>
                  </div>
                </div>
                <Button
                  size="icon"
                  className="brutalist-button-danger w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {navigationItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-300 brutalist-border brutalist-shadow mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-black" />
              </div>
              <p className="brutalist-text text-black">NO CHAT HISTORY YET</p>
              <p className="text-sm font-bold text-gray-600 mt-2">START A CONVERSATION TO SEE YOUR HISTORY HERE</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
