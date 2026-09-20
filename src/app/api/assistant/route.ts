import { NextResponse } from "next/server"
import { getWorkspaceData } from "@/lib/assistant/workspace"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const question = String(body?.question || "").trim()

    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      )
    }

    console.log("🤖 Assistant question:", question)

    const workspace = await getWorkspaceData()
    console.log("✅ Workspace loaded:", {
      properties: workspace.properties?.length || 0,
      units: workspace.units?.length || 0,
      tenants: workspace.tenants?.length || 0,
    })

    return NextResponse.json({
      workspace,
    })
  } catch (error: any) {
    console.error("❌ Assistant API Error:", error)

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to load workspace data.",
      },
      { status: 500 }
    )
  }
}