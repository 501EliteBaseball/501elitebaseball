import { NextResponse } from "next/server";
import { requireAccountingStaff } from "@/lib/accounting/require-accounting-staff";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
type Context={params:Promise<{id:string}>};

export async function PATCH(request:Request,{params}:Context){
 const auth=await requireAccountingStaff(request);if(!auth)return NextResponse.json({error:"Executive access required."},{status:403});
 const{id}=await params,body=await request.json() as{display_name?:string},name=body.display_name?.trim().slice(0,120);if(!name)return NextResponse.json({error:"Account name is required."},{status:400});
 const{data:account,error:readError}=await auth.client.from("family_accounts").select("family_id").eq("id",id).single();if(readError)return NextResponse.json({error:readError.message},{status:500});
 const{error}=await auth.client.from("family_accounts").update({display_name:name,updated_at:new Date().toISOString()}).eq("id",id);
 if(!error&&account.family_id)await createSupabaseAdmin().from("families").update({family_name:name,updated_at:new Date().toISOString()}).eq("id",account.family_id);
 return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({ok:true});
}

export async function DELETE(request:Request,{params}:Context){
 const auth=await requireAccountingStaff(request);if(!auth)return NextResponse.json({error:"Executive access required."},{status:403});const{id}=await params;
 const{error}=await auth.client.from("family_accounts").delete().eq("id",id);return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({ok:true});
}
