"use client"
import ChatPart from "../components/chatPart"
import { Navigation } from "../components/navigation"
import { Sidebar } from "../components/Navbar"
import { trpc } from "../clients/trpc"

function ChatPage() {
  return (
    <div className="bg-brutalist min-h-full h-[100vh]">
      <Navigation />
      <Sidebar />
      <div className="pt-4">
        <div className="h-[86vh]">
          <ChatPart />
        </div>
      </div>
    </div>
  )
}

export default trpc.withTRPC(ChatPage)
