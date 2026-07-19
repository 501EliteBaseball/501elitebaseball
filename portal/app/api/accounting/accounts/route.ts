import { NextResponse } from "next/server";
import { requireAccountingStaff } from "@/lib/accounting/require-accounting-staff";

export async function POST(request: Request) {
  const auth = await requireAccountingStaff(request);
  if (!auth) return NextResponse.json({ error: "Executive access required." }, { status: 403 });
  const body = await request.json() as { display_name?: string };
  const name = body.display_name?.trim().slice(0, 120);
  if (!name) return NextResponse.json({ error: "Account name is required." }, { status: 400 });
  const { data, error } = await auth.client.from("family_accounts").insert({ display_name: name }).select("id,account_number").single();
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data);
}
