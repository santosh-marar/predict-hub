// import SignInButton from "@/components/sign-button";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

export default async function Page() {
 

  return (
    <div className="flex items-center justify-center min-h-svh">
       <h1>Hello world</h1>
       <Link href="/sign-up">Sing up page</Link>
       {/* <SignInButton/> */}
    </div>
  );
}
