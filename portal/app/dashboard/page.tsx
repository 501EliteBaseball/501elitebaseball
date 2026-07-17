import { redirect } from "next/navigation";
import FamilyHome from "@/components/app/FamilyHome";
import { getFamilyDashboardData } from "@/lib/family/family-dashboard-service";
import { createSupabaseServer } from "@/lib/supabase-server";
export default async function DashboardPage(){const supabase=await createSupabaseServer();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");return <FamilyHome data={await getFamilyDashboardData(user.id,user.email??null)}/>}
