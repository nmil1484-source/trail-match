import { Link } from "wouter";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/trailmatch-logo.png" alt="TrailMatch" className="h-8 w-8" />
              <span className="text-lg font-bold">TrailMatch</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting off-road enthusiasts for unforgettable adventures on the trails.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Find Trips
                </Link>
              </li>
              <li>
                <Link href="/shops" className="text-muted-foreground hover:text-primary">
                  Shops
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/install" className="text-muted-foreground hover:text-primary">
                  📱 Install App
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <a 
              href="mailto:trailmatchsite@gmail.com" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              trailmatchsite@gmail.com
            </a>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TrailMatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
