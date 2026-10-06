import { redirect } from "next/navigation";

import { createClient } from "../supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("REQUIRE ADMIN - USER:", user);
  console.log("REQUIRE ADMIN - USER ERROR:", userError);

  if (!user) {
    console.log("REQUIRE ADMIN - REDIRECT: NO USER");
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select("id, nama, desa")
    .eq("id", user.id)
    .single();

  console.log("REQUIRE ADMIN - PROFILE:", profile);
  console.log("REQUIRE ADMIN - PROFILE ERROR:", error);

  if (error || !profile) {
    console.log("REQUIRE ADMIN - REDIRECT: NO PROFILE");
    redirect("/login");
  }

  return {
    user,
    profile,
    desa: profile.desa,
    isSuperAdmin: profile.desa === null,
  };
}
