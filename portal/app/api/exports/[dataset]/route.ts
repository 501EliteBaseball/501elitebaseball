import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { createCsv } from "@/lib/exports/csv";

type Context = { params: Promise<{ dataset: string }> };
type Row = Record<string, unknown>;
const dollars = (cents: number) => (cents / 100).toFixed(2);

export async function GET(_: Request, { params }: Context) {
  const server = await createSupabaseServer();
  const { data: { user } } = await server.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const admin = createSupabaseAdmin();
  const { data: member } = await admin.from("organization_members").select("role,active,can_view_medical").eq("user_id", user.id).maybeSingle();
  if (!member?.active || !["executive", "admin"].includes(member.role)) return NextResponse.json({ error: "Executive access required." }, { status: 403 });

  const { dataset } = await params;
  if (["medical", "emergency"].includes(dataset) && !member.can_view_medical) return NextResponse.json({ error: "Medical export permission required." }, { status: 403 });

  const [{ data: families }, { data: profiles }, { data: players }, { data: registrations }] = await Promise.all([
    admin.from("families").select("id,primary_parent_id,family_name,address_line_1,address_line_2,city,state,postal_code"),
    admin.from("profiles").select("id,email,first_name,last_name,phone"),
    admin.from("players").select("id,family_id,first_name,middle_name,last_name,preferred_name,date_of_birth,gender,school,grade,bats,throws,jersey_number_preference"),
    admin.from("registrations").select("id,family_id,player_id,season,status,current_step,submitted_at,created_at"),
  ]);
  const familyMap = new Map((families ?? []).map(row => [row.id, row]));
  const profileMap = new Map((profiles ?? []).map(row => [row.id, row]));
  const playerMap = new Map((players ?? []).map(row => [row.id, row]));
  let rows: Row[] = [];

  if (dataset === "roster") rows = (players ?? []).map(player => { const family=familyMap.get(player.family_id),parent=family?profileMap.get(family.primary_parent_id):null; return {Family:family?.family_name??"",Player_First:player.first_name,Player_Preferred:player.preferred_name,Player_Last:player.last_name,Date_of_Birth:player.date_of_birth??"",Grade:player.grade,School:player.school,Bats:player.bats,Throws:player.throws,Parent_First:parent?.first_name??"",Parent_Last:parent?.last_name??"",Parent_Email:parent?.email??"",Parent_Phone:parent?.phone??""}; });
  else if (dataset === "uniforms") { const {data}=await admin.from("uniform_profiles").select("player_id,registration_id,jersey_size,pants_size,hat_size,jersey_name,jersey_number_preference"); rows=(data??[]).map(item=>{const player=item.player_id?playerMap.get(item.player_id):null,family=player?familyMap.get(player.family_id):null;return{Family:family?.family_name??"",Player:player?`${player.first_name} ${player.last_name}`:"",Jersey_Name:item.jersey_name,Jersey_Number:item.jersey_number_preference,Jersey_Size:item.jersey_size,Pants_Size:item.pants_size,Hat_Size:item.hat_size};}); }
  else if (dataset === "medical") { const {data}=await admin.from("medical_profiles").select("player_id,physician_name,physician_phone,insurance_provider,policy_number,allergies,medications,medical_conditions,special_instructions"); rows=(data??[]).map(item=>{const player=playerMap.get(item.player_id),family=player?familyMap.get(player.family_id):null;return{Family:family?.family_name??"",Player:player?`${player.first_name} ${player.last_name}`:"",Allergies:item.allergies,Medications:item.medications,Medical_Conditions:item.medical_conditions,Special_Instructions:item.special_instructions,Physician:item.physician_name,Physician_Phone:item.physician_phone,Insurance:item.insurance_provider,Policy_Number:item.policy_number};}); }
  else if (dataset === "emergency") { const {data}=await admin.from("emergency_contacts").select("player_id,name,relationship,phone,alternate_phone,authorized_pickup"); rows=(data??[]).map(item=>{const player=playerMap.get(item.player_id),family=player?familyMap.get(player.family_id):null;return{Family:family?.family_name??"",Player:player?`${player.first_name} ${player.last_name}`:"",Emergency_Contact:item.name,Relationship:item.relationship,Phone:item.phone,Alternate_Phone:item.alternate_phone,Authorized_Pickup:item.authorized_pickup?"Yes":"No"};}); }
  else if (dataset === "registrations") rows=(registrations??[]).map(item=>{const family=familyMap.get(item.family_id),player=item.player_id?playerMap.get(item.player_id):null;return{Family:family?.family_name??"",Player:player?`${player.first_name} ${player.last_name}`:"",Season:item.season,Status:item.status,Current_Step:item.current_step,Submitted_At:item.submitted_at??"",Created_At:item.created_at};});
  else if (dataset === "accounting") { const [{data:accounts},{data:charges},{data:payments}]=await Promise.all([admin.from("family_accounts").select("id,family_id,account_number,display_name,status"),admin.from("account_charges").select("account_id,amount_cents,status,due_date"),admin.from("account_payments").select("account_id,amount_cents,status")]); rows=(accounts??[]).map(account=>{const billed=(charges??[]).filter(x=>x.account_id===account.id&&x.status==="posted").reduce((s,x)=>s+x.amount_cents,0),paid=(payments??[]).filter(x=>x.account_id===account.id&&x.status==="posted").reduce((s,x)=>s+x.amount_cents,0),family=account.family_id?familyMap.get(account.family_id):null;return{Account_Number:account.account_number,Account_Name:account.display_name||family?.family_name||"",Status:account.status,Billed:dollars(billed),Paid:dollars(paid),Balance:dollars(billed-paid)};}); }
  else if (dataset === "charges") { const [{data:accounts},{data:charges}]=await Promise.all([admin.from("family_accounts").select("id,account_number,display_name,family_id"),admin.from("account_charges").select("account_id,category,description,amount_cents,due_date,status,notes,created_at").order("created_at")]);const accountMap=new Map((accounts??[]).map(x=>[x.id,x]));rows=(charges??[]).map(item=>{const account=accountMap.get(item.account_id),family=account?.family_id?familyMap.get(account.family_id):null;return{Account_Number:account?.account_number??"",Account_Name:account?.display_name||family?.family_name||"",Category:item.category,Description:item.description,Amount:dollars(item.amount_cents),Due_Date:item.due_date??"",Status:item.status,Notes:item.notes,Created_At:item.created_at};}); }
  else if (dataset === "payments") { const [{data:accounts},{data:payments}]=await Promise.all([admin.from("family_accounts").select("id,account_number,display_name,family_id"),admin.from("account_payments").select("account_id,amount_cents,paid_at,method,reference,notes,status").order("paid_at")]);const accountMap=new Map((accounts??[]).map(x=>[x.id,x]));rows=(payments??[]).map(item=>{const account=accountMap.get(item.account_id),family=account?.family_id?familyMap.get(account.family_id):null;return{Account_Number:account?.account_number??"",Account_Name:account?.display_name||family?.family_name||"",Amount:dollars(item.amount_cents),Payment_Date:item.paid_at,Method:item.method,Reference:item.reference,Status:item.status,Notes:item.notes};}); }
  else return NextResponse.json({ error: "Unknown export dataset." }, { status: 404 });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(createCsv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="501-elite-${dataset}-${date}.csv"`, "Cache-Control": "private, no-store" } });
}
