import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-primary" />
        <Image
          src="https://picsum.photos/seed/campus/1920/1080"
          alt="University campus background"
          fill
          className="object-cover opacity-20"
          data-ai-hint="university campus"
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo className="w-8 h-8 mr-2" />
          T.U.E.M.I. System
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Optimizing university transportation for a seamless, safe,
              and efficient journey for every student and staff member.&rdquo;
            </p>
            <footer className="text-sm">EMI Administration</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Administrator</CardTitle>
              <CardDescription>
                Use the credentials provided by the technical team.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Username</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin_user"
                  required
                  defaultValue="admin@emi.edu"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  defaultValue="password"
                />
              </div>
              <Button asChild type="submit" className="w-full">
                <Link href="/dashboard">Login</Link>
              </Button>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-sm">
            Are you a student or staff member?{' '}
            <Link href="#" className="underline">
              Login or Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
